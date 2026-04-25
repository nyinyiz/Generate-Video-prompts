#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

import {
  promptCategories,
  validatePromptRecords,
  type PromptCategory,
  type PromptRecord,
} from "../lib/schema";

const DEFAULT_COUNT = 2;
const TITLE_DUPLICATE_THRESHOLD = 0.76;
const PROMPT_DUPLICATE_THRESHOLD = 0.82;
const MAX_ATTEMPTS_PER_PROMPT = 24;
const DEFAULT_TIME_ZONE = "Asia/Bangkok";

const titleAngles = [
  "First Step",
  "Quiet Proof",
  "Visible Shift",
  "Small Reset",
  "Honest Start",
  "Clear Signal",
  "Next Move",
  "Real Moment",
  "Better Rhythm",
  "Simple Proof",
  "Fresh Angle",
  "Human Detail",
  "Tiny Turn",
  "Open Loop",
  "Lasting Beat",
  "Grounded Take",
];

const titleContexts = [
  "Right Now",
  "At Dawn",
  "Under Pressure",
  "In Motion",
  "After the Pause",
  "Before the Leap",
  "With Focus",
  "In Real Time",
  "Past the Doubt",
  "For Today",
  "Without Noise",
  "In Plain Sight",
  "After the Reset",
  "With Clear Intent",
  "Before the Scroll",
  "At the Turning Point",
];

const focusDirections = [
  "Make the first three seconds immediately readable without extra context.",
  "Let one concrete object or gesture carry the idea through the sequence.",
  "Build the middle beat around a small before-and-after shift viewers can feel.",
  "Keep text overlays minimal and tied to action already visible on screen.",
  "Use pacing changes to make the transformation feel earned instead of forced.",
  "Give the final shot a clear emotional aftertaste that matches the hook.",
  "Show the cost of staying still before revealing the practical turning point.",
  "Make every cut answer the previous frame with a more specific detail.",
];

type GeneratorOptions = {
  count?: number;
  now?: Date;
  timeZone?: string;
};

type PromptTemplate = {
  titles: string[];
  visuals: string[];
  emotionalTones: string[];
  closes: string[];
  tags: string[];
  cameras: string[];
  lightings: string[];
  audios: string[];
};

type ContextTemplate = {
  settings: string[];
  subjects: string[];
  stakes: string[];
  props: string[];
  progressions: string[];
  formats: string[];
  avoids: string[];
};

const promptTemplates: Record<PromptCategory, PromptTemplate> = {
  "Daily Life": {
    titles: [
      "The Five-Minute Kitchen Reset",
      "Leaving the House Without the Rush",
      "A Desk That Lets You Breathe",
      "Tiny Rituals That Calm a Busy Morning",
      "Making Laundry Feel Like a Win",
    ],
    visuals: [
      "show tactile close-ups of hands clearing, folding, wiping, and resetting one small space",
      "track a simple routine through natural light, clean surfaces, and one satisfying final frame",
      "move from clutter to clarity with readable cuts and a steady lived-in pace",
      "keep the camera intimate with everyday objects, quiet gestures, and visible progress",
    ],
    emotionalTones: [
      "calm, grounding, and quietly satisfying",
      "warm, practical, and reassuring",
      "clean, steady, and emotionally relieving",
      "cozy, human, and low-pressure",
    ],
    closes: [
      "End on a frame that makes ordinary order feel like self-respect.",
      "Finish with one simple habit viewers can copy today.",
      "Let the final beat land as relief, not perfection.",
      "Close with a before-and-after contrast that feels earned.",
    ],
    tags: ["routine", "home", "lifestyle", "short-form"],
    cameras: [
      "Handheld with subtle natural shake for an authentic, lived-in feel.",
      "Static tripod with slow, controlled pans to emphasize order.",
      "Macro lens for extreme close-ups on textures and small movements.",
      "Eye-level perspective to maintain a relatable, personal connection.",
    ],
    lightings: [
      "Soft morning window light creating gentle shadows and high clarity.",
      "Warm golden hour glow to enhance the cozy, satisfying atmosphere.",
      "Bright, even daylight for a clean, energized productivity look.",
      "Low-contrast, diffused lighting for a calm and restorative mood.",
    ],
    audios: [
      "Ambient household sounds: distant birds, a ticking clock, soft fabric rustling.",
      "Clean foley: the sharp click of a switch, water pouring, or rhythmic folding.",
      "Soft, minimal lo-fi beats with a focus on steady, calming tempo.",
      "Natural silence broken only by the primary tactile action in the scene.",
    ],
  },
  "Human Nature": {
    titles: [
      "Why Small Kindness Hits So Hard",
      "The Story We Tell Ourselves First",
      "Why We Avoid the Tiny Tasks",
      "How Memory Keeps the Feeling, Not the Facts",
      "Why Private Praise Feels Different",
    ],
    visuals: [
      "cut between ordinary gestures, facial reactions, and small pauses that reveal the inner shift",
      "use reflective surfaces, notebooks, text messages, and close-ups that make the psychology feel personal",
      "anchor abstract ideas in familiar micro-moments people instantly recognize",
      "pair observational details with restrained movement so the emotion leads the sequence",
    ],
    emotionalTones: [
      "thoughtful, intimate, and emotionally honest",
      "curious, relatable, and quietly revealing",
      "reflective, human, and gently challenging",
      "warm, observant, and psychologically sharp",
    ],
    closes: [
      "End with one line that makes the viewer reconsider their own pattern.",
      "Close on a small expression that carries the whole insight.",
      "Finish with a question that stays with the viewer after the scroll.",
      "Let the last beat feel personal instead of preachy.",
    ],
    tags: ["psychology", "behavior", "reflection", "mindset"],
    cameras: [
      "Close-up portrait framing to capture subtle shifts in expression.",
      "Slow push-in to create a sense of intimacy and discovery.",
      "Over-the-shoulder perspective to place the viewer in the conversation.",
      "Static medium shots to allow the subject's behavior to lead the frame.",
    ],
    lightings: [
      "Moody, side-lit setups to emphasize depth and internal reflection.",
      "Soft, warm interior lighting for a sense of safety and vulnerability.",
      "Natural, unpolished light to maintain a raw, documentary-style truth.",
      "Subtle rim lighting to separate the subject from a dark, focused background.",
    ],
    audios: [
      "Restrained, emotive piano notes with plenty of space between keys.",
      "Clear, intimate voiceover with a warm, conversational texture.",
      "Atmospheric room tone: soft wind or distant, muffled city life.",
      "Heightened focus on micro-sounds: a deep breath, a pen on paper.",
    ],
  },
  Health: {
    titles: [
      "Water Before the World Wakes Up",
      "The Two-Minute Walk That Resets a Day",
      "Stretching Between Meetings",
      "Sleep Starts Before the Pillow",
      "A Tiny Habit for Better Energy",
    ],
    visuals: [
      "show simple movement, natural light, and practical habits in clean everyday environments",
      "keep the demo concrete with body language changing as the habit takes effect",
      "focus on clear, copyable actions rather than abstract wellness imagery",
      "use gentle pacing, uncluttered spaces, and visible relief in posture or mood",
    ],
    emotionalTones: [
      "fresh, practical, and reassuring",
      "supportive, calm, and genuinely useful",
      "restorative, clear, and quietly motivating",
      "grounded, healthy, and easy to trust",
    ],
    closes: [
      "Close with one action simple enough to try immediately.",
      "Finish on a physical cue that shows the benefit without overexplaining it.",
      "End with a calm reminder that better health can start small.",
      "Let the last shot feel like relief, not pressure.",
    ],
    tags: ["wellness", "habit", "energy", "health"],
    cameras: [
      "Wide, spacious framing to emphasize room to breathe and move.",
      "Follow-cam at waist height for an active, encouraging perspective.",
      "Top-down flatlay for clear, organized habit demonstrations.",
      "Steady tracking shots that move at a relaxed, walking pace.",
    ],
    lightings: [
      "High-key, bright natural light to symbolize energy and clarity.",
      "Soft, cool blue tones for evening routines and sleep prep.",
      "Warm, dappled sunlight for outdoor movement and vitality.",
      "Clean, clinical but warm lighting for a trustworthy health feel.",
    ],
    audios: [
      "Crisp, refreshing sound design: water splashing, deep exhales.",
      "Rhythmic, mid-tempo acoustic tracks that feel steady and upbeat.",
      "Natural outdoor soundscapes: rustling leaves, distant water.",
      "Minimalist electronic pulses that emphasize focus and flow.",
    ],
  },
  Technology: {
    titles: [
      "The Assistant Already in Your Pocket",
      "From Voice Note to Action Plan",
      "When the App Learns Your Rhythm",
      "A Cleaner Digital Workspace in Seconds",
      "Let the Boring Task Disappear",
    ],
    visuals: [
      "use crisp screen-driven storytelling with real tasks becoming easier in a few fast beats",
      "show phones, laptops, and hands moving through a believable workflow instead of a concept demo",
      "keep the interface readable with quick cuts, progress states, and one obvious payoff",
      "pair tech moments with real-life context so the usefulness feels immediate",
    ],
    emotionalTones: [
      "smart, modern, and practical",
      "energetic, clean, and genuinely helpful",
      "efficient, polished, and forward-looking",
      "futuristic without losing everyday realism",
    ],
    closes: [
      "End on the specific time or effort this tool gives back.",
      "Finish with a payoff that feels useful, not flashy.",
      "Close on a smoother workflow viewers can picture using tomorrow.",
      "Let the final frame show technology serving a real human need.",
    ],
    tags: ["ai", "productivity", "tools", "technology"],
    cameras: [
      "Sharp, high-definition macro shots of screens and tactile tech.",
      "Fast, rhythmic jump cuts to mimic digital speed and efficiency.",
      "Stable, low-angle shots of devices to make them feel powerful.",
      "Over-the-shoulder POV for an immersive 'user experience' feel.",
    ],
    lightings: [
      "Cool-toned, modern LEDs with subtle neon or cyan accents.",
      "High-contrast, dark environments to make screens pop with clarity.",
      "Clean, white studio lighting for a premium, minimalist tech look.",
      "Natural window light reflecting off glass for a realistic, daily-use feel.",
    ],
    audios: [
      "Satisfying digital haptics: subtle pings, sweeps, and UI clicks.",
      "Driving, synth-heavy background tracks with a high-tech pulse.",
      "Clean, dry voiceover that sounds authoritative and precise.",
      "Muted, low-frequency atmospheric hums for a sense of scale.",
    ],
  },
  Motivation: {
    titles: [
      "Five Minutes Still Counts",
      "Do It Before You Feel Ready",
      "One Hard Thing a Day",
      "Finish the Ugly Draft",
      "Momentum Starts Smaller Than You Think",
    ],
    visuals: [
      "show the first imperfect action, not the polished result, with clear physical movement",
      "build tension through countdowns, first reps, first words, or the first click of publish",
      "keep the sequence active and readable so progress feels possible right now",
      "use grounded scenes of work, training, or creative effort without turning it into a montage cliché",
    ],
    emotionalTones: [
      "direct, energizing, and credible",
      "steady, uplifting, and action-oriented",
      "honest, determined, and emotionally clean",
      "firm, hopeful, and momentum-building",
    ],
    closes: [
      "End with a line that makes starting feel smaller than waiting.",
      "Finish on the idea that consistency beats intensity.",
      "Close with visible progress, even if it is tiny.",
      "Let the final beat feel earned rather than inspirational for its own sake.",
    ],
    tags: ["motivation", "discipline", "action", "growth"],
    cameras: [
      "Dynamic, shaky handheld shots to convey effort and grit.",
      "Close-ups on sweat, strained muscles, or focused eyes.",
      "Low-angle hero shots to build a sense of power and overcome.",
      "Rapid tracking shots that keep pace with intense movement.",
    ],
    lightings: [
      "Harsh, high-contrast lighting to emphasize texture and struggle.",
      "Dramatically silhouetted subjects against a bright, rising sun.",
      "Cold, industrial lighting for a serious, disciplined atmosphere.",
      "Warm, lens-flare heavy sunbeams to symbolize hope and reward.",
    ],
    audios: [
      "Heavy, cinematic percussion with a deep, heartbeat-like thud.",
      "Intense, breathy sound design mixed close to the microphone.",
      "Orchestral swells that build tension and resolve with power.",
      "Gritty, lo-fi rock or blues for a 'hard work' aesthetic.",
    ],
  },
  Nature: {
    titles: [
      "Rain Writing on the Window",
      "Morning Light on Water",
      "Wind Through an Open Field",
      "Clouds Moving Faster Than the Day",
      "The Forest Right After Rain",
    ],
    visuals: [
      "lean into texture, ambient movement, and natural sound with slow deliberate camera motion",
      "show small environmental details before opening up to scale and atmosphere",
      "use macro moments, soft focus shifts, and wide reveals to create immersion",
      "let the environment carry the story with minimal text and patient framing",
    ],
    emotionalTones: [
      "reflective, immersive, and soothing",
      "calm, spacious, and quietly awe-filled",
      "soft, atmospheric, and emotionally restorative",
      "serene, tactile, and deeply present",
    ],
    closes: [
      "End on a final image that invites the viewer to breathe slower.",
      "Finish with one lingering environmental sound or motion cue.",
      "Close on stillness that feels earned after the movement.",
      "Let the last frame hold just long enough to become a mood.",
    ],
    tags: ["nature", "ambient", "cinematic", "outdoors"],
    cameras: [
      "Drone-like sweeping wide shots for a sense of majestic scale.",
      "Macro lens for droplets, leaves, and intricate natural textures.",
      "Slow-motion capture to emphasize the grace of natural movement.",
      "Fixed, long-exposure style shots to let the elements move through the frame.",
    ],
    lightings: [
      "Authentic 'Golden Hour' light with long, soft, orange shadows.",
      "Cool, misty 'Blue Hour' tones for a mysterious, quiet feel.",
      "Harsh, dramatic storm light with dark skies and bright highlights.",
      "Speckled 'forest floor' light filtered through thick canopies.",
    ],
    audios: [
      "High-fidelity field recordings: heavy rain, wind in pines, birdsong.",
      "Deep, resonant drone pads that blend into the environmental sound.",
      "Subtle, organic percussion like wooden blocks or soft chimes.",
      "The sound of moving water: ripples, waves, or steady mountain streams.",
    ],
  },
  Society: {
    titles: [
      "The Price of Always Being Busy",
      "Who Gets the Quiet Spaces",
      "The Invisible Work Holding Everything Up",
      "How a City Sounds When You Really Listen",
      "What Public Space Teaches Us About Care",
    ],
    visuals: [
      "contrast motion and stillness across streets, transit, public spaces, and everyday labor",
      "show people in shared environments with rhythmic cuts that reveal systems, not just scenes",
      "use observational footage that keeps individuals human while widening the social lens",
      "anchor the point in recognizable civic life so the theme feels immediate and lived-in",
    ],
    emotionalTones: [
      "thoughtful, humane, and quietly urgent",
      "observant, social, and emotionally grounded",
      "respectful, reflective, and community-minded",
      "clear-eyed, compassionate, and provocative",
    ],
    closes: [
      "End on one image that turns the social point into a human feeling.",
      "Finish with a question that makes the viewer re-enter their own surroundings differently.",
      "Close on a pause that gives the idea room to land.",
      "Let the final beat connect systems back to ordinary people.",
    ],
    tags: ["society", "culture", "community", "observation"],
    cameras: [
      "Telephoto compression to show the density and energy of a city.",
      "Low-angle, 'street-level' perspective to keep it grounded.",
      "Static wide shots of public spaces to watch the choreography of life.",
      "Quick, rhythmic panning between different people and actions.",
    ],
    lightings: [
      "Mixed city lighting: neon signs, streetlights, and shop windows.",
      "Flat, midday sun to capture the unvarnished reality of the street.",
      "Warm evening light hitting glass buildings for a cinematic urban feel.",
      "High-contrast shadows in alleys and underpasses for a gritty texture.",
    ],
    audios: [
      "Layered city soundscapes: traffic hum, muffled voices, sirens.",
      "Rhythmic, jazz-influenced or hip-hop beats with a street pulse.",
      "Documentary-style interview snippets or ambient 'vox pop' noise.",
      "Industrial, mechanical sounds mixed into a steady musical rhythm.",
    ],
  },
};

const contextTemplates: Record<PromptCategory, ContextTemplate> = {
  "Daily Life": {
    settings: [
      "a compact apartment kitchen before anyone else wakes up",
      "a sunlit desk beside a half-open window",
      "a laundry corner with warm towels and a small folding surface",
      "a hallway entry table crowded with keys, receipts, and shoes",
    ],
    subjects: [
      "a working adult trying to reclaim ten calm minutes",
      "a parent resetting one corner of the home between responsibilities",
      "a student making a small space feel usable again",
      "a creator preparing the room before the real work starts",
    ],
    stakes: [
      "the day feels noisy before it has even begun",
      "one ignored mess keeps pulling attention away from the next task",
      "the subject needs a visible win before momentum disappears",
      "ordinary clutter is quietly shaping the mood of the whole room",
    ],
    props: [
      "a chipped mug, soft cloth, timer, and stack of folded fabric",
      "keys, a notebook, tangled charger, and one small tray",
      "fresh towel, laundry basket, wooden hanger, and morning light",
      "sticky notes, water glass, pen, and a cleared rectangle of desk",
    ],
    progressions: [
      "start with one cramped frame, reveal the small decision, then widen as the space settles",
      "move from hesitation to one repeated action, then show the room becoming easier to breathe in",
      "cut between tiny tactile wins until the final frame feels lighter than the first",
      "show the subject choosing one manageable corner instead of trying to fix everything",
    ],
    formats: [
      "vertical lifestyle short with tactile inserts and clean natural pacing",
      "quiet before-and-after sequence with no exaggerated transformation",
      "POV reset built around hands, surfaces, and satisfying sound cues",
      "micro-documentary moment that makes a normal routine feel intentional",
    ],
    avoids: [
      "perfect showroom staging, fake smiles, and unrealistic spotless interiors",
      "generic productivity slogans or text that explains what the image already shows",
      "fast cleaning montage cliches that erase the human pace of the action",
      "visual clutter that makes the final change hard to read",
    ],
  },
  "Human Nature": {
    settings: [
      "a quiet cafe table after a difficult conversation",
      "a bedroom mirror lit by a single warm lamp",
      "a bus window reflection during the ride home",
      "an office stairwell where someone pauses before replying",
    ],
    subjects: [
      "a person replaying a small interaction that mattered more than expected",
      "two friends noticing the silence after one honest sentence",
      "a colleague deciding whether to send the vulnerable message",
      "someone catching their own pattern in an ordinary reflection",
    ],
    stakes: [
      "the emotion is small enough to hide but strong enough to change the next choice",
      "one private assumption is shaping the whole scene",
      "the subject wants certainty, but the moment asks for honesty",
      "a familiar defense mechanism is visible before the person names it",
    ],
    props: [
      "an unread message, paper cup, jacket sleeve, and fogged glass",
      "a notebook margin, pen mark, phone screen, and dim lamp",
      "two chairs, a half-finished drink, and a table between them",
      "a mirror, loose receipt, and hand resting near the send button",
    ],
    progressions: [
      "begin with a reaction, reveal the thought behind it, then land on a more generous interpretation",
      "contrast what the subject says with what their hands and pauses reveal",
      "let the insight arrive through one repeated gesture instead of a lecture",
      "move from guarded body language to one small sign of openness",
    ],
    formats: [
      "observational micro-drama with restrained voiceover",
      "psychology reel built from familiar social details",
      "intimate portrait sequence with reflective surfaces and quiet cuts",
      "documentary-style vignette where behavior carries the lesson",
    ],
    avoids: [
      "therapy buzzwords, preachy narration, or obvious moralizing",
      "overacted sadness and melodramatic reaction shots",
      "abstract symbolism that makes the human moment harder to recognize",
      "stock footage of anonymous crowds with no personal anchor",
    ],
  },
  Health: {
    settings: [
      "a small balcony at sunrise with a glass of water on the rail",
      "a quiet office corner between meetings",
      "a bedroom floor with soft evening light and a phone set face down",
      "a neighborhood sidewalk just after rain",
    ],
    subjects: [
      "a tired professional choosing one low-friction healthy action",
      "a beginner rebuilding trust with their body through small movement",
      "someone protecting their evening routine from another late scroll",
      "a person using a tiny habit to interrupt a draining day",
    ],
    stakes: [
      "energy is low and the habit has to feel doable, not heroic",
      "the subject needs relief before discipline can make sense",
      "the choice is small, but it changes the direction of the next hour",
      "the body is asking for attention before burnout becomes the main story",
    ],
    props: [
      "water glass, sneakers, towel, and a phone timer",
      "yoga mat, desk chair, blue light reflection, and notebook",
      "pill organizer, herbal tea, window shade, and clean bedsheet",
      "rain jacket, earbuds, step counter, and wet pavement",
    ],
    progressions: [
      "show tension in posture first, introduce one simple action, then reveal the physical release",
      "move from mental fog to a clear repeatable cue the viewer can copy",
      "keep the habit tiny and show how the subject makes it easier to start",
      "contrast screen fatigue with a grounded sensory reset",
    ],
    formats: [
      "practical wellness short with copyable steps and cinematic restraint",
      "gentle habit demo filmed like a calm daily ritual",
      "POV body reset with tactile sound and visible relief",
      "mini transformation sequence focused on posture, breath, and energy",
    ],
    avoids: [
      "medical claims, miracle language, and body-shaming framing",
      "extreme fitness imagery that makes the habit feel unreachable",
      "generic smoothie-and-sunrise wellness stock shots",
      "busy overlays that distract from the simple action",
    ],
  },
  Technology: {
    settings: [
      "a shared workspace with a laptop, phone, and messy task list",
      "a kitchen table turned into a night work setup",
      "a commuter train seat where a voice note becomes a plan",
      "a clean product desk with cables, tabs, and one visible bottleneck",
    ],
    subjects: [
      "a solo operator turning scattered inputs into one clear next step",
      "a creator using automation to protect creative energy",
      "a small business owner replacing a repetitive admin loop",
      "a student organizing research before the deadline pressure spikes",
    ],
    stakes: [
      "the tool has to prove usefulness in seconds, not just look futuristic",
      "manual friction is stealing time from the work that matters",
      "the subject is close to overwhelm until the workflow becomes visible",
      "one boring task is blocking a more human decision",
    ],
    props: [
      "voice memo waveform, calendar card, keyboard, and sticky task list",
      "messy browser tabs, charging cable, notebook, and progress indicator",
      "phone notification, laptop dock, coffee, and a clean export screen",
      "spreadsheet, chat window, timer, and a completed checklist",
    ],
    progressions: [
      "show the messy input, the tool interpreting it, then the useful output in a real context",
      "cut from repeated manual steps to one smoother automated sequence",
      "make the interface readable while the human benefit stays emotionally clear",
      "start with friction, reveal the workflow, then end on time returned",
    ],
    formats: [
      "screen-led product demo with human context and crisp macro shots",
      "before-and-after workflow reel with readable UI states",
      "day-in-the-life tech vignette where usefulness beats spectacle",
      "POV productivity short built around one practical automation",
    ],
    avoids: [
      "fake holograms, unreadable interfaces, and vague AI magic",
      "floating buzzwords that never connect to a concrete task",
      "overly glossy product shots with no human stakes",
      "screen glare or fast cuts that hide the workflow payoff",
    ],
  },
  Motivation: {
    settings: [
      "a quiet gym corner before sunrise with only one light on",
      "a bedroom desk at midnight beside a half-finished draft",
      "an empty basketball court after rain",
      "a small studio floor marked by tape, cables, and old attempts",
    ],
    subjects: [
      "a beginner choosing the first imperfect rep",
      "a tired creator returning to work after losing confidence",
      "someone rebuilding discipline after a visible setback",
      "a student starting before they feel ready",
    ],
    stakes: [
      "waiting has started to feel safer than trying",
      "the first action matters because confidence is not available yet",
      "the subject has proof of past failure in the frame",
      "the scene turns motivation into a physical choice, not a slogan",
    ],
    props: [
      "scuffed sneakers, phone timer, marked calendar, and cold coffee",
      "unfinished notebook page, hoodie sleeve, laptop glow, and red pen",
      "wet court lines, worn ball, breath in cold air, and empty bleachers",
      "tape marks, coiled cable, rejected notes, and a blinking record light",
    ],
    progressions: [
      "open on avoidance, show the smallest possible start, then make the next action feel inevitable",
      "let effort look unpolished first, then reveal momentum through repetition",
      "contrast the evidence of quitting with one visible decision to continue",
      "build from stillness to motion without pretending the doubt disappears",
    ],
    formats: [
      "cinematic discipline short grounded in one real action",
      "creator comeback vignette with tactile work details",
      "fitness or study reel that rejects hype and shows consistency",
      "POV first-step sequence with a clear emotional turn",
    ],
    avoids: [
      "generic motivational quotes, fake applause, and overdramatic victory shots",
      "perfect hero framing before the subject has earned it",
      "luxury success imagery that disconnects from the starting point",
      "montage cliches that skip the actual first action",
    ],
  },
  Nature: {
    settings: [
      "a forest path right after rain with dark soil and bright leaves",
      "a quiet lakeside edge before the sun clears the horizon",
      "a windswept field where grass moves in uneven waves",
      "a window looking out at storm clouds crossing the afternoon",
    ],
    subjects: [
      "a single natural detail slowly changing under patient observation",
      "the landscape itself treated as the main character",
      "a small human presence made quiet by the scale of the environment",
      "weather, texture, and light carrying the emotional arc",
    ],
    stakes: [
      "the piece needs stillness without becoming visually empty",
      "the viewer should feel time slowing through specific sensory detail",
      "the environment reveals change through movement, not explanation",
      "scale and intimacy need to trade places across the sequence",
    ],
    props: [
      "raindrops on leaves, mud on boots, mist, and a bent fern",
      "rippling water, smooth stones, pale sky, and distant birds",
      "wild grass, coat fabric, cloud shadow, and a narrow footpath",
      "window glass, rain trails, curtain edge, and muted room reflection",
    ],
    progressions: [
      "start macro, widen to atmosphere, then return to one detail with new meaning",
      "let wind or water introduce motion before the camera reveals scale",
      "move from surface texture to horizon so the mood opens slowly",
      "hold longer than expected, then reward patience with a subtle natural change",
    ],
    formats: [
      "ambient cinematic loop with high-fidelity environmental texture",
      "slow nature reel built from macro detail and wide release",
      "visual poem with minimal text and patient camera movement",
      "immersive field-recording sequence where sound leads the edits",
    ],
    avoids: [
      "generic postcard landscapes with no tactile detail",
      "oversaturated colors, fake wildlife moments, or rushed drone shots",
      "heavy text overlays that break the quiet",
      "stock nature montage pacing with no sense of place",
    ],
  },
  Society: {
    settings: [
      "a bus stop during the evening commute",
      "a public library table shared by strangers",
      "a market street as shops open and deliveries arrive",
      "a city bench beside traffic, workers, and passing families",
    ],
    subjects: [
      "several strangers connected by one overlooked public ritual",
      "a worker whose invisible effort changes everyone else's day",
      "a commuter noticing the system they usually move through automatically",
      "a small group sharing space without speaking directly",
    ],
    stakes: [
      "the social point has to stay human before it becomes analytical",
      "ordinary infrastructure reveals who gets comfort and who absorbs friction",
      "the scene asks viewers to notice a pattern they usually pass by",
      "care, labor, and access are visible through small repeated actions",
    ],
    props: [
      "transit card, worn bench, paper bag, and flickering schedule sign",
      "library books, charging cable, winter coat, and handwritten notice",
      "delivery crates, coins, shop shutter, and steam from breakfast food",
      "crosswalk button, cleaning cart, stroller wheel, and traffic reflection",
    ],
    progressions: [
      "follow one object through different hands until the system becomes visible",
      "contrast who waits, who moves, and who maintains the shared space",
      "start with a single face, widen to the pattern, then return to one human detail",
      "let repeated civic sounds become rhythm before the final question lands",
    ],
    formats: [
      "observational city vignette with documentary restraint",
      "social insight reel built from public-space details",
      "micro-documentary sequence where systems stay tied to faces",
      "street-level visual essay with rhythmic ambient sound",
    ],
    avoids: [
      "faceless crowd footage with no emotional anchor",
      "preachy text, partisan shorthand, or flattening people into symbols",
      "poverty aesthetics used as decoration",
      "wide city shots that never show the specific social pattern",
    ],
  },
};

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(value: string) {
  return normalizeText(value).replace(/\s+/g, "-");
}

function toDateString(date: Date, timeZone = DEFAULT_TIME_ZONE) {
  const parts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    timeZone,
    year: "numeric",
  }).formatToParts(date);
  const partMap = new Map(parts.map((part) => [part.type, part.value]));
  const year = partMap.get("year");
  const month = partMap.get("month");
  const day = partMap.get("day");

  if (!year || !month || !day) {
    throw new Error(`Unable to format date for time zone ${timeZone}.`);
  }

  return `${year}-${month}-${day}`;
}

function countLines(value: string) {
  return value
    .trim()
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0).length;
}

function tokenSet(value: string) {
  return new Set(normalizeText(value).split(" ").filter(Boolean));
}

function jaccardSimilarity(left: Set<string>, right: Set<string>) {
  if (left.size === 0 && right.size === 0) {
    return 1;
  }

  let shared = 0;
  for (const token of left) {
    if (right.has(token)) {
      shared += 1;
    }
  }

  const union = left.size + right.size - shared;
  return union === 0 ? 0 : shared / union;
}

function textSimilarity(left: string, right: string) {
  const normalizedLeft = normalizeText(left);
  const normalizedRight = normalizeText(right);

  if (!normalizedLeft || !normalizedRight) {
    return 0;
  }

  if (normalizedLeft === normalizedRight) {
    return 1;
  }

  return jaccardSimilarity(tokenSet(left), tokenSet(right));
}

function sentenceFragment(value: string) {
  return value.replace(/[.!?]+$/g, "");
}

function parseArgs(argv: string[]) {
  const args: { datasetPath?: string; count?: number } = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (token === "--file" || token === "--dataset") {
      args.datasetPath = argv[index + 1];
      index += 1;
      continue;
    }

    if (token === "--count" || token === "-n") {
      const value = Number(argv[index + 1]);
      if (!Number.isFinite(value) || value <= 0) {
        throw new Error(`Invalid count value: ${argv[index + 1]}`);
      }
      args.count = Math.floor(value);
      index += 1;
    }
  }

  return args;
}

function buildPromptText(category: PromptCategory, variantIndex: number) {
  const template = promptTemplates[category];
  const context = contextTemplates[category];
  const baseTitleIndex = variantIndex % template.titles.length;
  const baseTitle = template.titles[baseTitleIndex];
  const titleAngle = titleAngles[Math.floor(variantIndex / template.titles.length) % titleAngles.length];
  const titleContext =
    titleContexts[
      Math.floor(variantIndex / (template.titles.length * titleAngles.length)) % titleContexts.length
    ];
  const title = `${baseTitle}: ${titleAngle} ${titleContext}`;
  const visual = template.visuals[(variantIndex * 3) % template.visuals.length];
  const tone = template.emotionalTones[(variantIndex * 5 + 1) % template.emotionalTones.length];
  const close = template.closes[(variantIndex * 7 + 2) % template.closes.length];
  const focus = focusDirections[(variantIndex * 11 + promptCategories.indexOf(category)) % focusDirections.length];

  const camera = sentenceFragment(template.cameras[variantIndex % template.cameras.length]);
  const lighting = sentenceFragment(template.lightings[variantIndex % template.lightings.length]);
  const audio = sentenceFragment(template.audios[variantIndex % template.audios.length]);
  const setting = context.settings[baseTitleIndex % context.settings.length];
  const subject = context.subjects[(variantIndex * 3 + 1) % context.subjects.length];
  const stakes = context.stakes[(variantIndex * 5 + 2) % context.stakes.length];
  const props = context.props[(variantIndex * 7 + 3) % context.props.length];
  const progression = context.progressions[(variantIndex * 11 + 1) % context.progressions.length];
  const format = context.formats[(variantIndex * 13 + 2) % context.formats.length];
  const avoid = context.avoids[(variantIndex * 17 + 3) % context.avoids.length];

  return {
    title,
    prompt: [
      `Hook: ${title}; ${stakes}.`,
      `Scene: ${setting}, following ${subject}; include ${props}.`,
      `Story: ${progression}; visual direction: ${visual}.`,
      `Production: ${format}; tone: ${tone}; camera: ${camera}; lighting: ${lighting}; audio: ${audio}`,
      `Avoid: ${avoid}. ${focus} ${close}`,
    ].join("\n"),
    tags: template.tags,
    camera,
    lighting,
    audio,
  };
}

function nextSequence(records: PromptRecord[], date: string, category: PromptCategory) {
  const categorySlug = slugify(category);
  const matchingRecords = records.filter(
    (record) => record.date === date && record.category === category,
  );

  return String(matchingRecords.length + 1).padStart(3, "0").replace(/^/, `${date}-${categorySlug}-`);
}

function categoryCounts(records: PromptRecord[]) {
  return promptCategories.map((category) => ({
    category,
    count: records.filter((record) => record.category === category).length,
  }));
}

function selectCategory(records: PromptRecord[]) {
  return categoryCounts(records).sort((left, right) => {
    if (left.count !== right.count) {
      return left.count - right.count;
    }
    return promptCategories.indexOf(left.category) - promptCategories.indexOf(right.category);
  })[0]?.category ?? promptCategories[0];
}

function createPromptRecord(
  records: PromptRecord[],
  category: PromptCategory,
  now: Date,
  variantIndex: number,
  timeZone: string,
): PromptRecord {
  const date = toDateString(now, timeZone);
  const { title, prompt, tags, camera, lighting, audio } = buildPromptText(category, variantIndex);

  return {
    id: nextSequence(records, date, category),
    date,
    category,
    title,
    prompt,
    tags,
    camera,
    lighting,
    audio,
    createdAt: now.toISOString(),
  };
}

export function isDuplicateEntry(candidate: PromptRecord, existingEntries: PromptRecord[]) {
  return existingEntries.some((entry) => {
    const titleScore = textSimilarity(candidate.title, entry.title);
    const promptScore = textSimilarity(candidate.prompt, entry.prompt);

    return (
      titleScore >= TITLE_DUPLICATE_THRESHOLD ||
      promptScore >= PROMPT_DUPLICATE_THRESHOLD
    );
  });
}

export function generatePrompts(
  existingEntries: PromptRecord[],
  options: GeneratorOptions = {},
) {
  const count = options.count ?? DEFAULT_COUNT;
  const now = options.now ?? new Date();
  const timeZone = options.timeZone ?? DEFAULT_TIME_ZONE;
  const generated: PromptRecord[] = [];

  for (let index = 0; index < count; index += 1) {
    const records = [...existingEntries, ...generated];
    const category = selectCategory(records);
    let candidate: PromptRecord | null = null;

    for (let attempt = 0; attempt < MAX_ATTEMPTS_PER_PROMPT; attempt += 1) {
      const nextCandidate = createPromptRecord(
        records,
        category,
        now,
        records.length + attempt,
        timeZone,
      );

      if (countLines(nextCandidate.prompt) < 3 || countLines(nextCandidate.prompt) > 5) {
        continue;
      }

      if (isDuplicateEntry(nextCandidate, records)) {
        continue;
      }

      candidate = nextCandidate;
      break;
    }

    if (!candidate) {
      throw new Error(`Unable to generate a unique prompt for ${category}.`);
    }

    generated.push(candidate);
  }

  return generated;
}

export async function loadDataset(datasetPath: string) {
  const raw = JSON.parse(await readFile(datasetPath, "utf8")) as unknown;
  return validatePromptRecords(raw);
}

async function saveDataset(datasetPath: string, prompts: PromptRecord[]) {
  await writeFile(datasetPath, `${JSON.stringify(prompts, null, 2)}\n`, "utf8");
}

export async function main(
  argv = process.argv.slice(2),
  cwd = process.cwd(),
  now = new Date(),
) {
  const { datasetPath, count } = parseArgs(argv);
  const resolvedDatasetPath = path.resolve(cwd, datasetPath ?? "data/prompts.json");
  const existingEntries = await loadDataset(resolvedDatasetPath);
  const additions = generatePrompts(existingEntries, {
    count,
    now,
  });
  const updatedEntries = validatePromptRecords([...existingEntries, ...additions]);

  await saveDataset(resolvedDatasetPath, updatedEntries);
  process.stdout.write(
    `Added ${additions.length} prompt${additions.length === 1 ? "" : "s"} to ${resolvedDatasetPath}\n`,
  );

  return { additions, updatedEntries, datasetPath: resolvedDatasetPath };
}

const isEntrypoint =
  process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (isEntrypoint) {
  main().catch((error) => {
    const message = error instanceof Error ? error.stack ?? error.message : String(error);
    process.stderr.write(`${message}\n`);
    process.exitCode = 1;
  });
}
