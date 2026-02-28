import {
  collection,
  doc,
  setDoc,
  addDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { GameState, GameCreature, GamePhase } from './types';
import type { HistoryEvent } from '../types';

// ── Session CRUD ──────────────────────────────────────────

export async function createSession(uid: string): Promise<string> {
  const sessionsRef = collection(db, 'users', uid, 'sessions');
  const docRef = await addDoc(sessionsRef, {
    createdAt: serverTimestamp(),
    currentRound: 1,
    phase: 'intro' as GamePhase,
    creature: null,
  });
  return docRef.id;
}

export async function saveGameState(
  uid: string,
  sessionId: string,
  state: GameState,
): Promise<void> {
  const sessionRef = doc(db, 'users', uid, 'sessions', sessionId);
  await setDoc(
    sessionRef,
    {
      currentRound: state.round,
      phase: state.phase,
      chaosLevel: state.chaosLevel,
      creature: state.creature ? serializeCreature(state.creature) : null,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function saveGameEvent(
  uid: string,
  sessionId: string,
  event: HistoryEvent & { fullData?: unknown },
): Promise<void> {
  const eventsRef = collection(db, 'users', uid, 'sessions', sessionId, 'events');
  await addDoc(eventsRef, {
    type: event.type,
    title: event.title,
    summary: event.summary,
    fullData: event.fullData ?? null,
    timestamp: serverTimestamp(),
  });
}

export async function loadSession(
  uid: string,
  sessionId: string,
): Promise<{ phase: GamePhase; round: number; creature: GameCreature | null } | null> {
  const sessionRef = doc(db, 'users', uid, 'sessions', sessionId);
  const snap = await getDoc(sessionRef);
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    phase: data.phase ?? 'intro',
    round: data.currentRound ?? 1,
    creature: data.creature ?? null,
  };
}

export async function listSessions(
  uid: string,
): Promise<{ id: string; createdAt: Date; phase: string; creature: string | null }[]> {
  const sessionsRef = collection(db, 'users', uid, 'sessions');
  const q = query(sessionsRef, orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
      phase: data.phase ?? 'intro',
      creature: data.creature?.name ?? null,
    };
  });
}

// ── Helpers ───────────────────────────────────────────────

function serializeCreature(c: GameCreature): Record<string, unknown> {
  return {
    name: c.name,
    species: c.species,
    description: c.description,
    traits: c.traits,
    vulnerabilities: c.vulnerabilities,
    stats: c.stats,
    energyStrategy: c.energyStrategy,
    generation: c.generation,
    birthWords: c.birthWords,
  };
}
