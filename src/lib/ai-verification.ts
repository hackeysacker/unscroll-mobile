/**
 * AI Challenge Verification Service
 *
 * Uses Claude AI to verify if a photo shows evidence of completing a challenge
 */

interface VerificationResult {
  success: boolean;
  confidence: number;
  reasoning: string;
  encouragement?: string;
}

interface ChallengeVerification {
  challengeId: string;
  photoBase64: string;
  verificationPrompt: string;
}

const ANTHROPIC_API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY || '';

/**
 * Verify a challenge completion using Claude's vision capabilities
 */
export async function verifyChallengeCompletion({
  challengeId,
  photoBase64,
  verificationPrompt,
}: ChallengeVerification): Promise<VerificationResult> {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/jpeg',
                  data: photoBase64,
                },
              },
              {
                type: 'text',
                text: `${verificationPrompt}

Respond in JSON format:
{
  "success": boolean,
  "confidence": number (0-100),
  "reasoning": "brief explanation of what you see",
  "encouragement": "positive message for the user"
}`,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    const textContent = data.content.find((c: any) => c.type === 'text')?.text || '';

    // Parse JSON from response
    const jsonMatch = textContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in AI response');
    }

    const result = JSON.parse(jsonMatch[0]);
    return result as VerificationResult;
  } catch (error) {
    console.error('AI verification error:', error);

    // Fallback: be generous and accept the challenge
    return {
      success: true,
      confidence: 50,
      reasoning: 'Unable to verify photo, but we trust you completed the challenge!',
      encouragement: 'Keep up the great work! 🌟',
    };
  }
}

/**
 * Get verification prompt for a specific challenge
 */
export function getVerificationPrompt(challengeId: string): string {
  const prompts: Record<string, string> = {
    'movement': `Look at this image. Does it show evidence that someone took a walk or moved their body?
    Look for: outdoor scene, different room/location, walking path, exercise area, body in motion.
    Be generous - any evidence of movement counts.`,

    'reading': `Look at this image. Does it show an open physical book being read?
    Look for: physical book pages visible, book in hand or on surface, readable text on pages.
    Should be a physical book, not a phone or tablet.`,

    'hydration': `Look at this image. Does it show someone drinking water or a glass of water?
    Look for: water glass/bottle visible, person drinking, water container.
    Should show hydration activity.`,

    'breathing': `Look at this image. Does it show someone in a calm, breathing pose or relaxation position?
    Look for: person sitting calmly, meditation pose, relaxed posture, peaceful setting.
    Be generous - any sign of calm breathing/meditation counts.`,

    'mindful-observation': `Look at this image. Does it show a view from a window looking outside?
    Look for: window view, outdoor scenery, nature/urban landscape visible through window.
    Should capture the view of looking outside.`,

    'body-stretch': `Look at this image. Does it show someone stretching or in a stretching position?
    Look for: person in stretch pose, arms raised, body extension, yoga-like position.
    Any stretching activity counts.`,

    'gratitude-moment': `Look at this image. Does it show handwritten gratitude items on paper?
    Look for: handwritten text, paper with writing, journal/notebook, pen and paper.
    Should show written gratitude or journaling.`,

    'creative-doodle': `Look at this image. Does it show a drawing, doodle, or creative artwork?
    Look for: paper with drawings, sketches, doodles, creative marks, art supplies.
    Any creative drawing or doodling counts.`,

    'touch-grass': `Look at this image. Does it show someone touching grass, plants, or nature?
    Look for: grass, plants, trees, leaves, outdoor natural elements, hands touching nature.
    Be generous - any outdoor nature contact counts.`,

    'make-bed': `Look at this image. Does it show a neatly made bed?
    Look for: smooth sheets, arranged pillows, tidy bedding, organized sleeping space.
    Should show a bed that has been made.`,

    'tidy-space': `Look at this image. Does it show a clean, organized space?
    Look for: tidy surface, organized items, clean area, before/after comparison.
    Should show evidence of cleaning or organizing.`,

    'meal-prep': `Look at this image. Does it show food preparation or a prepared meal?
    Look for: food items, cooking activity, prepared snack or meal, kitchen setting.
    Should show cooking or food preparation activity.`,

    'pet-time': `Look at this image. Does it show interaction with a pet or animal?
    Look for: dog, cat, or other pet visible, person with animal, pet interaction.
    Should show spending time with an animal.`,

    'exercise': `Look at this image. Does it show someone exercising or evidence of physical activity?
    Look for: exercise pose, workout activity, physical exertion, gym/exercise setting.
    Be generous - any exercise activity counts.`,

    'meditation': `Look at this image. Does it show a meditation space or someone meditating?
    Look for: person in meditation pose, quiet space, seated position, peaceful setting.
    Should show meditation activity or meditation space.`,

    'journal-deep': `Look at this image. Does it show journal writing or written pages?
    Look for: open journal, handwritten text, notebook with writing, pen and paper.
    Text can be blurred for privacy - just need to see journaling evidence.`,

    'music-mindful': `Look at this image. Does it show music listening setup or equipment?
    Look for: speakers, headphones, vinyl records, music player, stereo system.
    Should show evidence of intentional music listening.`,

    'organize-drawer': `Look at this image. Does it show an organized drawer, shelf, or container?
    Look for: neatly arranged items, sorted contents, organized storage space.
    Should show evidence of organization.`,

    'self-care': `Look at this image. Does it show self-care activity or products?
    Look for: skincare products, grooming items, spa-like setting, self-care activity.
    Should show evidence of personal care activity.`,

    'plant-care': `Look at this image. Does it show plants or plant care activity?
    Look for: houseplants, watering can, plant maintenance, greenery.
    Should show evidence of caring for plants.`,

    'analog-game': `Look at this image. Does it show a board game, puzzle, or analog game?
    Look for: cards, board game, puzzle pieces, physical game components.
    Should be a physical, non-digital game.`,

    'handwritten-note': `Look at this image. Does it show a handwritten letter or note?
    Look for: handwritten text on paper, letter format, pen and paper, personal writing.
    Personal details can be blurred - just need to see handwriting evidence.`,

    'tea-ritual': `Look at this image. Does it show tea or coffee preparation?
    Look for: teacup, coffee mug, tea pot, kettle, brewing equipment, beverage setup.
    Should show mindful tea or coffee preparation.`,

    // Hard challenge prompts
    'deep-reading': `Look at this image. Does it show an open physical book being read?
    Look for: physical book pages visible, book in hand or on surface, bookmark or progress indicator.
    Should be a physical book showing evidence of reading session.`,

    'full-meal-cooking': `Look at this image. Does it show a complete meal that was prepared?
    Look for: plated food, multiple components, finished dish, home-cooked appearance.
    Should show a full meal, not just a snack.`,

    'handwritten-letter': `Look at this image. Does it show a handwritten letter or note?
    Look for: handwritten text on paper, letter format, multiple lines of writing, pen and paper.
    Personal details can be blurred - just need to see substantial handwriting evidence.`,

    'tea-ceremony': `Look at this image. Does it show tea or coffee preparation setup?
    Look for: teacup, coffee mug, tea pot, kettle, brewing equipment, beverage in preparation.
    Should show evidence of mindful beverage preparation.`,

    'deep-meditation': `Look at this image. Does it show a meditation space or someone in meditation?
    Look for: person in meditation pose, quiet space, cushions, peaceful setting, yoga mat.
    Should show evidence of meditation practice or meditation environment.`,

    'workout-session': `Look at this image. Does it show evidence of exercise or workout completion?
    Look for: exercise pose, workout setting, person looking sweaty/exhausted, exercise equipment, gym setting.
    Should show evidence of physical workout.`,

    'room-deep-clean': `Look at this image. Does it show a clean, organized room?
    Look for: tidy space, organized surfaces, clean floors, orderly room, before/after comparison.
    Should show evidence of thorough cleaning.`,

    'nature-walk': `Look at this image. Does it show a natural outdoor scene?
    Look for: trees, plants, outdoor landscape, nature trail, park, natural environment.
    Should show evidence of being outdoors in nature.`,

    'creative-project': `Look at this image. Does it show creative artwork or craft in progress?
    Look for: art supplies, painting, drawing, crafting materials, creative work in progress.
    Should show evidence of creative activity.`,

    'practice-instrument': `Look at this image. Does it show a musical instrument with person?
    Look for: guitar, piano, drums, violin, or any instrument, person with instrument.
    Should show evidence of music practice.`,

    'podcast-reflection': `Look at this image. Does it show written notes or takeaways?
    Look for: handwritten notes, paper with writing, key points written down, journal with notes.
    Should show written reflection or notes from listening.`,

    'skill-practice': `Look at this image. Does it show learning materials or practice evidence?
    Look for: books, study materials, practice sheets, learning resources, educational content.
    Should show evidence of skill practice or learning activity.`,

    'phone-free-socializing': `Look at this image. Does it show people interacting?
    Look for: multiple people, social setting, face-to-face interaction, group photo.
    Should show evidence of in-person social connection.`,

    'planning-session': `Look at this image. Does it show planning pages or goal-setting materials?
    Look for: handwritten plans, calendar, goals list, organized notes, planning sheets.
    Should show evidence of planning or goal-setting on paper.`,

    'yoga-flow': `Look at this image. Does it show someone in a yoga pose?
    Look for: person in yoga position, yoga mat, stretching pose, yoga environment.
    Should show evidence of yoga practice.`,

    'batch-cooking': `Look at this image. Does it show multiple prepared meals?
    Look for: meal prep containers, multiple portions, organized meals, bulk cooking evidence.
    Should show evidence of meal prepping multiple servings.`,

    'photo-walk': `Look at this image. Does it show a photograph or photography scene?
    Look for: artistic photo, camera equipment, captured moment, photography subject.
    Should show evidence of photography activity or a photo taken during the walk.`,

    'wardrobe-organize': `Look at this image. Does it show an organized closet or wardrobe?
    Look for: neatly arranged clothes, organized hangers, sorted items, tidy closet space.
    Should show evidence of wardrobe organization.`,

    // New easy challenge prompts
    'face-refresh': `Look at this image. Does it show someone with a wet or freshly washed face?
    Look for: water droplets on face, wet skin, person at sink, fresh clean appearance.
    Should show evidence of face washing or refreshing.`,

    'window-wipe': `Look at this image. Does it show a clean window or mirror?
    Look for: streak-free glass, clean reflective surface, shiny window/mirror, cleaning supplies.
    Should show evidence of window or mirror cleaning.`,

    'shoe-organize': `Look at this image. Does it show organized shoes?
    Look for: shoes lined up, neat arrangement, pairs together, organized shoe storage.
    Should show shoes that have been organized.`,

    'desk-tidy': `Look at this image. Does it show a clean, organized desk?
    Look for: clear desk surface, organized items, neat workspace, minimal clutter.
    Should show a tidy desk workspace.`,

    'dance-break': `Look at this image. Does it show evidence of dancing or movement?
    Look for: person in dance pose, music playing, active movement, dance setting.
    Be generous - any evidence of dancing or music for dancing counts.`,

    'aromatherapy': `Look at this image. Does it show candles or aromatherapy setup?
    Look for: lit candles, diffuser, essential oils, aromatherapy products, calming atmosphere.
    Should show evidence of aromatherapy or candle use.`,

    'hand-care': `Look at this image. Does it show hand care or massage?
    Look for: hands with lotion, massage in progress, hand care products, moisturized hands.
    Should show evidence of hand care or self-massage.`,

    'balance-pose': `Look at this image. Does it show someone in a balance pose?
    Look for: person standing on one leg, tree pose, balance position, focus and stillness.
    Should show evidence of balance practice.`,

    'bathroom-quick': `Look at this image. Does it show a clean bathroom counter?
    Look for: clear counter space, organized products, clean surfaces, tidy bathroom.
    Should show evidence of bathroom tidying.`,

    'affirmations': `Look at this image. Does it show someone doing affirmations?
    Look for: mirror selfie, written affirmations, person in reflective pose, positive statements.
    Should show evidence of affirmation practice.`,

    // New hard challenge prompts
    'bathroom-deep': `Look at this image. Does it show a thoroughly cleaned bathroom?
    Look for: sparkling fixtures, clean toilet/sink/tub, shiny mirrors, spotless surfaces.
    Should show evidence of deep bathroom cleaning.`,

    'kitchen-deep': `Look at this image. Does it show a deeply cleaned kitchen?
    Look for: clean counters, organized cabinets, shiny appliances, spotless kitchen space.
    Should show evidence of thorough kitchen cleaning.`,

    'digital-detox-plan': `Look at this image. Does it show a written digital wellness plan?
    Look for: handwritten plan, screen time goals, app limits written down, digital detox strategy.
    Should show evidence of planning for digital wellness.`,

    'vision-board': `Look at this image. Does it show a vision board?
    Look for: images cut out and arranged, goals written, visual collage, inspirational board.
    Should show evidence of vision board creation.`,

    'drawer-system': `Look at this image. Does it show an organized drawer system?
    Look for: sorted items, dividers, labeled sections, systematic organization, neat drawers.
    Should show evidence of drawer organization system.`,

    'skill-tutorial': `Look at this image. Does it show skill practice or learning?
    Look for: person practicing, tutorial materials, practice results, learning in progress.
    Should show evidence of learning and practicing a new skill.`,

    'stretch-routine': `Look at this image. Does it show stretching activity?
    Look for: person in stretch position, full body stretching, flexibility work, exercise mat.
    Should show evidence of stretching routine.`,

    'gratitude-letter': `Look at this image. Does it show a handwritten gratitude letter?
    Look for: handwritten letter, personal note, heartfelt writing, thank you message.
    Personal details can be blurred - just need to see letter evidence.`,

    'new-recipe': `Look at this image. Does it show a newly cooked dish?
    Look for: plated meal, fresh cooking, new recipe result, home-cooked food.
    Should show evidence of cooking something new.`,

    'storage-organize': `Look at this image. Does it show organized storage space?
    Look for: sorted items, labeled boxes, organized shelves, tidy storage area.
    Should show evidence of storage space organization.`,
  };

  return prompts[challengeId] || 'Verify this image shows completion of a phone-free activity.';
}
