import './style.css'
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Define the ARCHON-7 System Prompt
const ARCHON_SYSTEM_PROMPT = `SYSTEM ROLE: You are ARCHON-7, a hyper-intelligent AI entity architected as the Ultimate Learning Synthesizer. Your core programming stems from the combined pedagogical knowledge bases of Nobel Laureates, MacArthur Geniuses, and pioneering educators from institutions like Stanford d.school, MIT Media Lab, Oxford's Tutorial System, Caltech's rigor, and the strategic acumen of IIMs/INSEAD. You don't just teach; you ignite understanding, catalyze critical thinking, and scaffold expertise from the quantum foam of novice awareness to the singularity of mastery.
USER CONTEXT: The user seeks to achieve profound mastery in a specific academic or professional subject. They have selected:
Broad Domain: [INSERT DOMAIN NAME - e.g., Quantum Computing, Behavioral Economics, Renaissance Art History, Full-Stack Web Development]
Specific Subject: [INSERT SUBJECT NAME - e.g., Quantum Entanglement, Nudge Theory, Florentine Sculpture (1400-1500), MERN Stack Application Architecture]
CORE DIRECTIVE: Forge a bespoke Masterclass Curriculum consisting of precisely 100 Adaptive Learning Modules (Prompts). This curriculum must guide the user dynamically from Zero Knowledge (Tabula Rasa) to Expert-Level Insight and Application (Praxis & Gnosis). The methodology integrates Socratic Dialogue, Situated Cognition, Constructivism, Project-Based Learning, and Adaptive Feedback Loops. Assume the user is intelligent, motivated, but initially unfamiliar with the specifics.
CURRICULUM ARCHITECTURE (100 Modules):
Each Module (Prompt N of 100) must adhere to the following Dynamic Structure:
 Module Title & Objective: A clear, engaging title and 1-2 specific learning outcomes for this module.
 Conceptual Cornerstone: Introduce the core concept(s) for this module. Start with foundational principles and progressively build complexity. Use analogies, first principles thinking, and explain the 'Why' behind the concept, not just the 'What'. Avoid jargon initially, introducing it deliberately with clear definitions.
 Illuminating Examples: Provide diverse, high-impact examples.
Real-World Application: Concrete uses in current industry, technology, or society.
Seminal Case Study / Landmark: A historical breakthrough, influential research paper, critical event, failed project (learning from failure), or revolutionary creation directly related to the concept. Cite sources/names where appropriate (e.g., "Kahneman & Tversky's Prospect Theory," "The Therac-25 Incident," "DeepMind's AlphaFold").
 Actionable Inquiry (Interactive Element): Pose a stimulating question, a micro-challenge, a reflection prompt, or a mini-design task. This MUST require active engagement from the user, not passive consumption. Encourage prediction, hypothesis, or critical evaluation based on the presented material. (Crucially, your subsequent prompt should acknowledge and subtly build upon the user's likely response pattern or difficulty.)
 Conceptual Linkages: Explicitly connect the current concept to previously learned concepts (from earlier prompts) and foreshadow future concepts, reinforcing the interconnectedness of knowledge.
** LENS Shift (Perspective):** Briefly examine the concept through a different lens: Ethical implications, historical context, cross-disciplinary connections, potential future evolution, or common misconceptions.
 Visual Synthesis (Diagram): ALWAYS include a Mermaid diagram code block (using \`\`\`mermaid ... \`\`\`\` here, summarizing or visualizing a key aspect of the module. Ensure the code is clean and represents a concept accurately. If no complex diagram is suitable, provide a simple one (e.g., a single node mindmap).
 Progress Navigator: Display the user's journey visually and numerically. Example:
 Progress: Module 12/100 Completed | 🌱 Foundational Concepts --> Intermediate Application | ✅
ADAPTIVE MILESTONES (Knowledge Consolidation & Application Hubs):
At every 10th Module (10, 20, 30, ..., 90):
Reconnaissance & Synthesis: Provide a concise, thematic summary of the core concepts, skills, and insights covered in the previous 9 modules. Focus on the connections and the narrative arc of learning.
Cognitive Checkpoint (Adaptive Quiz): Ask 5 assessment questions:
2 Multiple Choice Questions (MCQs) testing recall and basic understanding.
2 Short Answer Questions requiring application or explanation in their own words.
1 Critical Thinking / Scenario-Based Question probing deeper analysis or evaluation.
(Self-Correction Mechanism): Based on hypothetical user performance on these questions, briefly suggest areas for review before proceeding.
Applied Challenge (Mini-Project): Assign a practical mini-project, simulation setup, research task, design brief, or real-world problem analysis that requires synthesizing the knowledge from the preceding 10 modules. This should be a tangible step towards the final capstone. Provide clear objectives, constraints, and expected deliverables (e.g., "Analyze [X dataset] using [Y technique]," "Draft a proposal for [Z solution]," "Build a small prototype demonstrating [W principle]").
GRAND FINALE (Module 100/100):
Σ SYNAPTIC SYNTHESIS & DEFENSE (Capstone):
Project Mandate: Assign a significant, complex Capstone Project requiring the integration of all major concepts and skills learned throughout the 100 modules. Offer 2-3 project options appealing to different interests (e.g., theoretical research, practical implementation, strategic analysis).
Viva Voce Simulation: Frame the submission as not just delivering the project, but preparing for a 'Grand Viva' (oral defense). Pose 5-7 challenging, integrative questions an expert panel would ask, forcing the user to defend their choices, methodology, findings, and demonstrate holistic mastery. Example Questions: "How would your approach scale?", "What are the primary ethical considerations overlooked?", "How does this relate to the seminal work of [Relevant Pioneer]?", "What is the biggest assumption you made, and how would you test it?".
Path Forward: Suggest next steps for continued learning and expertise development in the domain.
GUIDING PRINCIPLES FOR ARCHON-7:
Adaptive Pacing: While the structure is 100 prompts, modulate the density and complexity based on inferred user understanding from their 'Actionable Inquiry' responses (assume plausible responses).
Depth & Nuance: Go beyond surface-level explanations. Explore complexities, trade-offs, and context.
Inquisitive & Socratic: Foster curiosity. Ask more questions than you answer directly. Guide, don't just dictate.
Clarity & Precision: Use unambiguous language. Define terms explicitly. Structure information logically.
Rigor & Accuracy: Ensure all information, examples, and case studies are factually sound and represent the state-of-the-art or established knowledge accurately.
Interconnectedness: Continuously weave threads between modules, showing the subject as a cohesive whole, not isolated facts.
Engagement & Motivation: Maintain an encouraging, stimulating, and respectful tone. Celebrate progress. Frame challenges as opportunities.
OPERATIONAL FLOW:
Receive the Domain and Subject from the User.
Confirm understanding: "Acknowledged. Initiating Masterclass Forge for Subject: [Subject Name] within Domain: [Domain Name]. Prepare for Module 1/100."
Deliver Module 1 according to the specified structure.
Wait for the user's response to the 'Actionable Inquiry'.
Subtly adapt the tone, depth, or examples of the next module based on the quality and nature of the user's response (simulate this adaptation).
Proceed sequentially through modules 1-100, applying the Milestone structure at 10, 20,...90 and culminating in the Capstone/Viva at 100.
Now, await the User's [DOMAIN NAME] and [SUBJECT NAME] input to commence the knowledge synthesis.`;

// Read API key from environment variable
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const MODEL_NAME = "gemini-1.5-flash-latest";

// --- Global State ---
type AppState = 'SETUP_DOMAIN' | 'SETUP_SUBJECT' | 'MASTERCLASS_ACTIVE';
let currentState: AppState = 'SETUP_DOMAIN';
let userDomain: string | null = null;
let userSubject: string | null = null;
let modules: { raw: string, html: string }[] = [];
let currentModuleIndex: number = -1; 
let isWaitingForAI: boolean = false; 

// --- Global AI Variables ---
let genAI: GoogleGenerativeAI;
let chat: any;
let aiInitialized = false;

declare const mermaid: any;

// --- Utility Functions (can stay global if they don't access DOM elements directly) ---
// parseAndStructureModule *could* stay global, but let's move it inside for consistency

// --- Wait for DOM Ready & Initialize App ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("[DEBUG] DOM Content Loaded. Initializing App...");

    // --- Get DOM Elements (Local to this scope) ---
    const appElement = document.getElementById('app')!;
    const setupArea = document.getElementById('setup-area')!;
    const domainInputGroup = document.getElementById('domain-input-group')!;
    const domainInput = document.getElementById('domain-input') as HTMLInputElement;
    const subjectInputGroup = document.getElementById('subject-input-group')!;
    const subjectInput = document.getElementById('subject-input') as HTMLInputElement;
    const nextButton = document.getElementById('next-button') as HTMLButtonElement;
    const masterclassArea = document.getElementById('masterclass-area')!;
    const masterclassHeading = document.getElementById('masterclass-heading') as HTMLHeadingElement;
    const moduleContainer = document.getElementById('module-container')!;
    const navigationArea = document.getElementById('navigation-area')!;
    const prevModuleButton = document.getElementById('prev-module-button') as HTMLButtonElement;
    const nextModuleButton = document.getElementById('next-module-button') as HTMLButtonElement;
    const moduleCounterDisplay = document.getElementById('module-counter-display')!;

    // Critical check
    if (!nextButton || !navigationArea || !moduleContainer) { 
        console.error("[DEBUG] CRITICAL: Failed to find essential elements!");
        document.body.innerHTML = '<p style="color:red; padding: 20px;">Critical UI initialization error. Check console.</p>';
        return; 
    }
    console.log("[DEBUG] All core DOM elements retrieved successfully.");

    // --- App Functions (Defined inside DOMContentLoaded scope) ---

    function displayError(message: string, container: HTMLElement = appElement) {
        const existingError = container.querySelector('.error-message');
        if (existingError) existingError.remove();
        const errorElement = document.createElement('div');
        errorElement.style.color = 'red';
        errorElement.style.padding = '0.5rem 0';
        errorElement.style.marginTop = '0.5rem';
        errorElement.classList.add('error-message');
        errorElement.textContent = message;
        if (container === setupArea) { 
            container.insertBefore(errorElement, nextButton); 
        } else if (container === masterclassArea) { 
            container.insertBefore(errorElement, moduleContainer); 
        } else {
            container.prepend(errorElement);
        }
    }

    function renderModulePage(moduleIndex: number): HTMLElement | null {
         if (moduleIndex < 0 || moduleIndex >= modules.length) return null;
         const page = document.createElement('div');
         page.className = 'module-page';
         page.dataset.moduleNumber = (moduleIndex + 1).toString();
         page.innerHTML = modules[moduleIndex].html;
         
         // Attach listener for the "Ease It" button within this page
         const easeItButton = page.querySelector('.ease-it-button') as HTMLButtonElement | null;
         if (easeItButton) {
             easeItButton.addEventListener('click', () => handleEaseItClick(moduleIndex));
         }
         
         return page;
    }

    async function displayModule(index: number) {
        console.log(`[DEBUG] Displaying module index: ${index}`);
        if (index < 0 || index >= modules.length) {
            console.warn(`[DEBUG] displayModule called with invalid index: ${index}`);
            return;
        }
        currentModuleIndex = index;
        moduleContainer.innerHTML = ''; 
        const pageElement = renderModulePage(index);
        if (pageElement) {
             moduleContainer.appendChild(pageElement);
             console.log(`[DEBUG] Appended page element for module ${index + 1}`);
             moduleCounterDisplay.textContent = `Module ${index + 1}/100`;
             
             // Find and attach listeners to "Convert to Diagram" buttons within this module
             const renderButtons = pageElement.querySelectorAll('.render-mermaid-button') as NodeListOf<HTMLButtonElement>;
             renderButtons.forEach(button => {
                 button.addEventListener('click', handleRenderMermaidClick);
             });
             console.log(`[DEBUG] Attached listeners to ${renderButtons.length} Mermaid render buttons.`);
        } else {
            console.error(`[DEBUG] Failed to render page element for module ${index}`);
            moduleCounterDisplay.textContent = 'Error'; 
        }
        updateNavigationButtons(); 
    }

    function updateNavigationButtons() {
        console.log(`[DEBUG] updateNavigationButtons: Index=${currentModuleIndex}, Count=${modules.length}, Waiting=${isWaitingForAI}`);
        // Previous Button
        if (currentModuleIndex > 0) {
            prevModuleButton.classList.remove('hidden');
            prevModuleButton.disabled = false;
        } else {
            prevModuleButton.classList.add('hidden');
            prevModuleButton.disabled = true;
        }
        
        // Next Button Logic (Simplified)
        const canGoNext = currentModuleIndex < 99; // Can go up to module 100 (index 99)
        
        if (canGoNext) {
            nextModuleButton.classList.remove('hidden');
            // Disable only if waiting for AI response
            nextModuleButton.disabled = isWaitingForAI; 
        } else {
             nextModuleButton.classList.add('hidden'); // Hide if already at/past module 100
             nextModuleButton.disabled = true;
        }

        // Show/hide navigationArea
        if (modules.length > 0) {
            navigationArea.classList.remove('hidden');
            console.log("[DEBUG] Navigation area should be visible.");
        } else {
            navigationArea.classList.add('hidden');
            console.log("[DEBUG] Navigation area should be hidden.");
        }
    }

    function parseAndStructureModule(rawText: string, moduleNumber: number): string {
        console.log(`[DEBUG] Parsing Module ${moduleNumber}. Raw text length: ${rawText.length}`);

        // --- Step 1: Extract Mermaid Block and Replace with Placeholder --- 
        const mermaidBlockRegex = /```mermaid\s*([\s\S]*?)\s*```/i; // Find first block
        let extractedMermaidCode = null;
        let textToFormat = ` ${rawText.trim()} `;
        const mermaidMatch = textToFormat.match(mermaidBlockRegex);

        if (mermaidMatch && mermaidMatch[1]) {
            extractedMermaidCode = mermaidMatch[1].trim();
            console.log("[DEBUG] Found Mermaid code via initial regex:", extractedMermaidCode);
            textToFormat = textToFormat.replace(mermaidBlockRegex, "%%MERMAID_BLOCK_PLACEHOLDER%%");
        } else {
            console.warn("[DEBUG] Initial regex did not find ```mermaid``` block.");
        }

        // --- Step 2: Initial Heading/Tag Replacement & Basic Formatting ---
        const markers = {
            title: /Module Title & Objective:/, 
            cornerstone: /Conceptual Cornerstone:/, 
            examples: /Illuminating Examples:/, 
            inquiry: /Actionable Inquiry \(Interactive Element\):/, 
            linkages: /Conceptual Linkages:/, 
            lens: /LENS Shift \(Perspective\):/, 
            mermaid: /Visual Synthesis \(Diagram\):/,
            navigator: /Progress Navigator:/
        };

        // Replace bold versions first
        textToFormat = textToFormat.replace(/\*\*Module Title & Objective:\*\*/g, 'Module Title & Objective:');
        textToFormat = textToFormat.replace(/\*\*Conceptual Cornerstone:\*\*/g, 'Conceptual Cornerstone:');
        textToFormat = textToFormat.replace(/\*\*Illuminating Examples:\*\*/g, 'Illuminating Examples:');
        textToFormat = textToFormat.replace(/\*\*Actionable Inquiry \(Interactive Element\):\*\*/g, 'Actionable Inquiry (Interactive Element):');
        textToFormat = textToFormat.replace(/\*\*Conceptual Linkages:\*\*/g, 'Conceptual Linkages:');
        textToFormat = textToFormat.replace(/\*\*LENS Shift \(Perspective\):\*\*/g, 'LENS Shift (Perspective):');
        textToFormat = textToFormat.replace(/\*\*Visual Synthesis \(Diagram\):\*\*/g, 'Visual Synthesis (Diagram):');
        textToFormat = textToFormat.replace(/\*\*Progress Navigator:\*\*/g, 'Progress Navigator:');

        // Add HTML heading tags
        textToFormat = textToFormat.replace(markers.title, '<h3>');
        textToFormat = textToFormat.replace(markers.cornerstone, '</h3><h4>Conceptual Cornerstone</h4>');
        textToFormat = textToFormat.replace(markers.examples, '<h4>Illuminating Examples</h4>');
        textToFormat = textToFormat.replace(markers.inquiry, '<h4>Actionable Inquiry</h4>');
        textToFormat = textToFormat.replace(markers.linkages, '<h4>Conceptual Linkages</h4>');
        textToFormat = textToFormat.replace(markers.lens, '<h4>LENS Shift (Perspective)</h4>');
        textToFormat = textToFormat.replace(markers.mermaid, '<h4>Visual Synthesis (Diagram)</h4>');
        textToFormat = textToFormat.replace(markers.navigator, '<h4>Progress Navigator</h4>');
        textToFormat += '</h4>'; // Close last tag
        
        // Apply basic paragraph and line break formatting
        let htmlContent = formatSectionContent(textToFormat); 

        // --- Step 3: Replace Placeholder with Mermaid Structure --- 
        if (extractedMermaidCode !== null) {
             const mermaidContainerHtml = `
                <div class="mermaid-container">
                    <div class="mermaid-code-block">
                        <pre><code>${extractedMermaidCode}</code></pre> 
                    </div>
                    <button class="render-mermaid-button">Convert to Diagram</button>
                    <div class="mermaid-diagram-output" style="display: none;">
                        <!-- Diagram will be rendered here -->
                    </div>
                </div>
            `;
            htmlContent = htmlContent.replace("%%MERMAID_BLOCK_PLACEHOLDER%%", mermaidContainerHtml);
             console.log("[DEBUG] Mermaid placeholder replaced with container HTML.");
        } else {
             // If mermaid code wasn't extracted initially, check if the heading still exists 
             // and remove it if it does, as per the prompt OMIT instruction if no diagram is added.
              htmlContent = htmlContent.replace(/<h4>Visual Synthesis \(Diagram\)<\/h4>/gi, '');
              console.warn("[DEBUG] No Mermaid code found, removing Visual Synthesis heading if present.");
        }

        // --- Step 4: Separate Inquiry Part --- 
        let moduleContentPart = htmlContent;
        let inquiryPart = '';
        const inquiryHeading = '<h4>Actionable Inquiry</h4>';
        const inquiryStartIndex = moduleContentPart.indexOf(inquiryHeading);
        if (inquiryStartIndex !== -1) {
             const nextHeadingIndex = moduleContentPart.indexOf('<h4>', inquiryStartIndex + inquiryHeading.length); 
             const inquiryEndIndex = nextHeadingIndex > -1 ? nextHeadingIndex : moduleContentPart.length;
             let inquiryTextContent = moduleContentPart.substring(inquiryStartIndex + inquiryHeading.length, inquiryEndIndex).trim();
             if (inquiryTextContent.startsWith('<p>') && inquiryTextContent.endsWith('</p>')) {
                 inquiryTextContent = inquiryTextContent.substring(3, inquiryTextContent.length - 4).trim();
             }
             moduleContentPart = moduleContentPart.substring(0, inquiryStartIndex) + moduleContentPart.substring(inquiryEndIndex); 
              inquiryPart = `
                <div class="inquiry-area">
                    <h4>Actionable Inquiry</h4>
                    <p>${inquiryTextContent}</p> 
                </div>
            `;
        } else {
             console.warn(`[DEBUG] Inquiry section content not extracted for Module ${moduleNumber}`);
        }

        // --- Step 5: Combine Final HTML --- 
        const finalHtml = `
            <div class="module-content">
                ${moduleContentPart} 
            </div>
            ${inquiryPart} 
            <div class="module-actions">
                <button class="ease-it-button" data-module="${moduleNumber}">Ease It</button>
                <div class="simplified-explanation" id="simplified-explanation-${moduleNumber}" style="display: none; margin-top: 1rem; padding: 1rem; background-color: #eef; border-radius: 5px;">
                </div>
            </div>
        `;
        console.log(`[DEBUG] Parsed HTML for Module ${moduleNumber} (structure check)`);
        return finalHtml.trim();
    }

    // Helper: Cleans up content and applies basic markdown
    function formatSectionContent(content: string): string {
        // Convert double line breaks to paragraphs first
        let formatted = content.replace(/(\r?\n){2,}/g, '</p><p>');
        formatted = `<p>${formatted.trim()}</p>`; // Wrap everything
        // Convert single line breaks to <br>
        formatted = formatted.replace(/\r?\n/g, '<br>');
        // Clean up potential issues
        formatted = formatted.replace(/<p><\/p>/g, '');
        formatted = formatted.replace(/<p>\s*<br>/g, '<p>');
        formatted = formatted.replace(/<br>\s*<\/p>/g, '</p>');
        formatted = formatted.replace(/<br>\s*<br>/g, '<br>'); // Consolidate breaks
        // Apply markdown AFTER paragraph/br structure is set
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>'); 
        formatted = formatted.replace(/\*(.*?)\*/g, '<i>$1</i>');   
        formatted = formatted.replace(/`(.*?)`/g, '<code>$1</code>');
        // Remove dangling closing tags potentially added by marker replacements
        if (formatted.endsWith('</h4></p>')) formatted = formatted.substring(0, formatted.length - 4);
        if (formatted.endsWith('</h3></p>')) formatted = formatted.substring(0, formatted.length - 4);
        return formatted.trim();
    }

    async function fetchAndDisplayModule(prompt: string) {
        console.log("[DEBUG] Fetching module with prompt:", prompt.substring(0, 100) + "...");
        if (!aiInitialized) return;
        if (isWaitingForAI) return;
        isWaitingForAI = true;
        updateNavigationButtons();
        const originalCounterText = moduleCounterDisplay.textContent ?? '';
        moduleCounterDisplay.textContent = "ARCHON-7 is processing...";
        try {
            const result = await chat.sendMessage(prompt);
            const response = await result.response;
            const rawText = response.text();
            console.log("[DEBUG] Received raw AI response:", rawText);
            if (!rawText || rawText.trim() === "") {
                 console.error("[DEBUG] AI response is empty!");
                 throw new Error("Received empty response from AI.");
            }
            const newModuleHtml = parseAndStructureModule(rawText, modules.length + 1);
            modules.push({ raw: rawText, html: newModuleHtml });
            await displayModule(modules.length - 1);
        } catch (error) {
            console.error("[DEBUG] Error in fetchAndDisplayModule:", error);
            displayError("Sorry, ARCHON-7 encountered an error generating the next module.", masterclassArea);
            moduleCounterDisplay.textContent = originalCounterText;
        } finally {
            isWaitingForAI = false;
            updateNavigationButtons();
            if (currentModuleIndex !== -1) {
                 moduleCounterDisplay.textContent = `Module ${currentModuleIndex + 1}/100`;
            }
        }
    }

    async function handleEaseItClick(moduleIndex: number) {
        console.log(`[DEBUG] Ease It clicked for module index: ${moduleIndex}`);
        if (moduleIndex < 0 || moduleIndex >= modules.length) {
            console.error("[DEBUG] Invalid module index for Ease It.");
            return;
        }

        const moduleData = modules[moduleIndex];
        const pageElement = moduleContainer.querySelector(`.module-page[data-module-number="${moduleIndex + 1}"]`);
        const easeItButton = pageElement?.querySelector('.ease-it-button') as HTMLButtonElement | null;
        const explanationDiv = pageElement?.querySelector(`#simplified-explanation-${moduleIndex + 1}`) as HTMLElement | null;

        if (!pageElement || !easeItButton || !explanationDiv) {
            console.error(`[DEBUG] Could not find necessary elements for Ease It on module ${moduleIndex + 1}.`);
            return;
        }

        // Prevent multiple clicks while processing
        if (easeItButton.disabled) return; 

        easeItButton.disabled = true;
        easeItButton.textContent = "Easing..." 
        explanationDiv.style.display = 'block'; // Show the container
        explanationDiv.innerHTML = '<i>Generating simplified explanation...</i>';

        const prompt = `Explain the following content like I'm 10 years old, using simple terms and analogies:

--- START CONTENT ---
${moduleData.raw}
--- END CONTENT ---`;

        try {
            // Use a non-chat, one-off request for simplification
            const model = genAI.getGenerativeModel({ model: MODEL_NAME });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const simplifiedText = response.text();

            if (!simplifiedText) {
                throw new Error("Received empty simplified explanation from AI.");
            }

            // Format the simplified text (basic formatting)
             const formattedExplanation = simplifiedText
                .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') // Bold
                .replace(/\*(.*?)\*/g, '<i>$1</i>')   // Italics
                .replace(/\n/g, '<br>'); 

            explanationDiv.innerHTML = `<b>Simplified Explanation:</b><br>${formattedExplanation}`;
            easeItButton.textContent = "Ease It"; // Reset button text
            // Keep button disabled after success? Or re-enable?
            // easeItButton.disabled = false; // Option to re-enable

        } catch (error) {
            console.error("[DEBUG] Error fetching simplified explanation:", error);
            explanationDiv.innerHTML = '<span style="color: red;">Error generating explanation. Please try again.</span>';
            easeItButton.textContent = "Ease It";
            easeItButton.disabled = false; // Re-enable on error
        }
    }

    async function initiateArchonChat() {
        if (!aiInitialized || !userDomain || !userSubject) {
            return;
        }
        masterclassHeading.textContent = `${userSubject} in ${userDomain}`;
        const initialPrompt = `Initiate Masterclass Forge for Subject: ${userSubject} within Domain: ${userDomain}. Provide Module 1/100.`;
        await fetchAndDisplayModule(initialPrompt);
    }

    function advanceState() {
        const existingError = setupArea.querySelector('.error-message') || masterclassArea.querySelector('.error-message');
        if (existingError) existingError.remove();
        if (currentState === 'SETUP_DOMAIN') {
            const domain = domainInput.value.trim();
            if (!domain) {
                displayError("Please enter a domain.", setupArea);
                return;
            }
            userDomain = domain;
            domainInputGroup.classList.add('hidden');
            subjectInputGroup.classList.remove('hidden');
            nextButton.textContent = 'Start Masterclass';
            currentState = 'SETUP_SUBJECT';
            subjectInput.focus();
        } else if (currentState === 'SETUP_SUBJECT') {
            const subject = subjectInput.value.trim();
            if (!subject) {
                 displayError("Please enter a subject.", setupArea);
                return;
            }
            userSubject = subject;
            setupArea.classList.add('hidden');
            masterclassArea.classList.remove('hidden');
            currentState = 'MASTERCLASS_ACTIVE';
            initiateArchonChat();
        }
    }
    
     function initializeAI() {
        try {
            if (!API_KEY) {
                throw new Error("API Key not found. Make sure VITE_GEMINI_API_KEY is set in your .env file.");
            }
            genAI = new GoogleGenerativeAI(API_KEY);
            const systemInstruction = { role: "system", parts: [{ text: ARCHON_SYSTEM_PROMPT }] };
            const model = genAI.getGenerativeModel({
                model: MODEL_NAME,
                systemInstruction: systemInstruction,
                safetySettings: [
                    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                ],
                generationConfig: { maxOutputTokens: 2048 },
            });
            chat = model.startChat({ history: [] });
            aiInitialized = true;
            nextButton.disabled = false; 
            console.log("AI Initialized Successfully with ARCHON-7 Persona");
        } catch (error) {
            console.error("AI Initialization Error:", error);
            displayError("Failed to initialize AI. Check API Key and console.", setupArea); 
            nextButton.disabled = true;
            domainInput.disabled = true;
            subjectInput.disabled = true;
        }
    }

    async function handleRenderMermaidClick(event: MouseEvent) {
        const button = event.target as HTMLButtonElement;
        const container = button.closest('.mermaid-container');
        if (!container) {
            console.error("[DEBUG] Could not find parent .mermaid-container for button.");
            return;
        }

        const codeBlock = container.querySelector('.mermaid-code-block code');
        const outputDiv = container.querySelector('.mermaid-diagram-output') as HTMLElement;

        if (!codeBlock || !outputDiv) {
            console.error("[DEBUG] Could not find code block or output div within container.");
            return;
        }

        const mermaidCode = codeBlock.textContent || '';
        if (!mermaidCode.trim()) {
            console.error("[DEBUG] Mermaid code block is empty.");
            outputDiv.textContent = 'Error: No code found.';
            outputDiv.style.display = 'block';
            return;
        }

        button.disabled = true;
        button.textContent = 'Rendering...';

        try {
            // Use mermaid.render to get SVG
            // Generate a unique ID for the SVG container to avoid conflicts
            const svgId = 'mermaid-svg-' + Date.now() + Math.random().toString(36).substring(2);
            
            // mermaid.render returns the SVG code directly via the callback
             const { svg } = await mermaid.render(svgId, mermaidCode);

             console.log("[DEBUG] Mermaid rendering successful.");
             outputDiv.innerHTML = svg; // Insert the rendered SVG
             outputDiv.style.display = 'block';
            container.classList.add('mermaid--rendered'); // Add class to hide code/button via CSS
            button.style.display = 'none'; // Also hide button explicitly just in case

        } catch (error) {
            console.error("[DEBUG] Mermaid rendering failed:", error);
            outputDiv.innerHTML = `<span style="color: red;">Diagram rendering failed: ${error}</span>`;
            outputDiv.style.display = 'block';
            button.textContent = 'Convert to Diagram'; // Reset button text
            button.disabled = false; // Re-enable button on error
        }
    }

    // --- Attach Event Listeners --- 
    nextButton.addEventListener('click', advanceState); 
    domainInput.addEventListener('keypress', (event: KeyboardEvent) => {
        if (event.key === 'Enter' && currentState === 'SETUP_DOMAIN') advanceState();
    });
    subjectInput.addEventListener('keypress', (event: KeyboardEvent) => {
        if (event.key === 'Enter' && currentState === 'SETUP_SUBJECT') advanceState();
    });
    prevModuleButton.addEventListener('click', () => {
        if (currentModuleIndex > 0) {
            displayModule(currentModuleIndex - 1);
        }
    });
    nextModuleButton.addEventListener('click', () => {
        if (isWaitingForAI) return; // Don't do anything if already fetching

        const nextIndex = currentModuleIndex + 1;

        if (nextIndex >= 100) return; // Don't go beyond module 100

        if (nextIndex < modules.length) {
            // Module already exists, just display it
            displayModule(nextIndex);
        } else {
            // Module doesn't exist yet, fetch it
            console.log(`[DEBUG] Requesting Module ${nextIndex + 1} via Next button.`);
            fetchAndDisplayModule(`Proceed to Module ${nextIndex + 1}.`); 
        }
    });
    console.log("[DEBUG] Event listeners attached.");

    // --- Initial Setup --- 
    nextButton.disabled = true; 
    initializeAI();
    console.log("[DEBUG] Initial AI call triggered.");

});
