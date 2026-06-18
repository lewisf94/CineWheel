// ============================================================================
//  Films: the wheel list, the spin result, and the watch + finish flow
// ============================================================================

import {
  db,
  doc,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  runTransaction,
  arrayUnion,
  Timestamp,
} from "./firebase.js";
import { getMemberId, getName } from "./session.js";

export async function addMovie(code, title) {
  const t = (title || "").trim();
  if (!t) return;
  await addDoc(collection(db, "groups", code, "movies"), {
    title: t,
    addedByName: getName(),
    addedByMemberId: getMemberId(),
    addedAt: serverTimestamp(),
    status: "wheel",
    pickedAt: null,
    watchedAt: null,
    deadline: null,
  });
}

// Remove a not-yet-picked film from the wheel.
export async function removeMovie(code, movieId) {
  await deleteDoc(doc(db, "groups", code, "movies", movieId));
}

// Record the result of a spin. The wheel `segments` + `winnerIndex` are stored
// in lastSpin so every connected browser animates the exact same wheel, even
// though the winner immediately leaves the "wheel" status. currentFilm is the
// authoritative film-of-the-week; lastSpin just drives the animation overlay.
// watchedBy starts empty and fills as each member confirms they've watched.
export async function commitSpin(code, segments, winnerIndex, spinnerName, deadlineDate) {
  const winner = segments[winnerIndex];
  const deadline = Timestamp.fromDate(deadlineDate);
  const now = Timestamp.now();
  const stamp = Date.now();

  await updateDoc(doc(db, "groups", code, "movies", winner.id), {
    status: "current",
    pickedAt: serverTimestamp(),
    deadline,
    watchedBy: [],
  });
  await updateDoc(doc(db, "groups", code), {
    currentFilm: {
      movieId: winner.id,
      title: winner.title,
      addedByName: winner.addedByName || "",
      spinnerName: spinnerName || "",
      pickedAt: now,
      deadline,
    },
    lastSpin: {
      seed: stamp,
      startedAt: stamp,
      durationMs: 6000,
      segments: segments.map((s) => ({ id: s.id, title: s.title })),
      winnerIndex,
      spinnerName: spinnerName || "",
    },
  });
}

// Adjust the watch-by deadline for the current film.
export async function setDeadline(code, movieId, date) {
  const deadline = Timestamp.fromDate(date);
  await updateDoc(doc(db, "groups", code, "movies", movieId), { deadline });
  await runTransaction(db, async (tx) => {
    const groupRef = doc(db, "groups", code);
    const g = await tx.get(groupRef);
    const cf = g.data().currentFilm;
    if (cf && cf.movieId === movieId) {
      tx.update(groupRef, { currentFilm: { ...cf, deadline } });
    }
  });
}

// Record that THIS member has watched the current film. Idempotent.
export async function markWatchedAck(code, movieId, memberId) {
  await updateDoc(doc(db, "groups", code, "movies", movieId), {
    watchedBy: arrayUnion(memberId),
  });
}

// Finish the round: move the film into history (which reveals everyone's
// reviews), clear the film-of-the-week, and advance the turn to the next
// person. Idempotent and transactional, so it's safe even if several browsers
// trigger it at the same moment, or after it has already happened.
export async function finalizeRound(code, movieId) {
  const groupRef = doc(db, "groups", code);
  await runTransaction(db, async (tx) => {
    const g = await tx.get(groupRef);
    const data = g.data();
    if (!data || !data.currentFilm || data.currentFilm.movieId !== movieId) return;
    const order = data.memberOrder || [];
    const nextIndex = order.length
      ? ((data.currentSpinnerIndex || 0) + 1) % order.length
      : 0;
    tx.update(doc(db, "groups", code, "movies", movieId), {
      status: "watched",
      watchedAt: serverTimestamp(),
    });
    tx.update(groupRef, { currentFilm: null, currentSpinnerIndex: nextIndex });
  });
}
