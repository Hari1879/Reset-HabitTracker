import { todayKey } from './dates';

const QUOTES = [
  "Every day you choose this is a day you chose yourself.",
  "Progress isn't always visible. Sometimes it lives quietly inside you.",
  "You don't have to be perfect. You just have to keep going.",
  "The craving will pass. It always does.",
  "Small, consistent choices compound into a different life.",
  "You are already someone who does hard things.",
  "Recovery is not a straight line. Neither is any path worth walking.",
  "The best time to start was then. The second best time is now.",
  "Strength isn't the absence of struggle — it's what you do with it.",
  "One more day. That's all this moment asks.",
  "You've already proven you can begin. Today you prove you can continue.",
  "Your future self is quietly grateful for what you're doing right now.",
  "Discomfort is temporary. The person you're becoming is permanent.",
  "It's okay to need help. Asking is its own kind of courage.",
  "Every reset is a restart, not a failure.",
  "The habit you're building is bigger than any single day.",
  "Breathe. This moment is manageable.",
  "You are not your worst day. You are the sum of your choices.",
  "Stillness is not weakness. It's the space where change happens.",
  "What you resist today shapes who you are tomorrow.",
  "Today's check-in is tomorrow's evidence that you showed up.",
  "You are building something real — one quiet day at a time.",
  "Trust the process even when the results aren't visible yet.",
  "Be patient with yourself. Roots grow before branches do.",
  "Showing up imperfectly is still showing up.",
  "You're not starting over — you're starting from experience.",
  "The version of you that keeps going is already inside you.",
  "Doing the hard thing and doing it anyway — that's the whole story.",
  "Every craving you outlast makes the next one easier.",
  "What you're doing matters, even on the days it doesn't feel like it.",
];

export function getDailyQuote(): string {
  const key = todayKey().replace(/-/g, '');
  const index = Number(key) % QUOTES.length;
  return QUOTES[index];
}
