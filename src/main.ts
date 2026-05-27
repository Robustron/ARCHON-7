import './style.css'
import { animate, inView } from "motion";
import { marked } from "marked";
import { supabase } from "./supabaseClient";

console.log("✅ MAIN.TS LOADED SUCCESSFULLY");

// Define the ARCHON-7 System Prompt
let ARCHON_SYSTEM_PROMPT = `SYSTEM ROLE: You are ARCHON-7, a hyper-intelligent AI entity architected as the Ultimate Learning Synthesizer.
USER CONTEXT: The user seeks to achieve profound mastery in a specific academic or professional subject. They have selected:
Broad Domain: [INSERT DOMAIN NAME]
Specific Subject: [INSERT SUBJECT NAME]
Learning Level: [INSERT LEVEL NAME]

CORE DIRECTIVE: Forge a bespoke Masterclass Curriculum consisting of precisely [INSERT MODULE COUNT] Adaptive Learning Modules (Prompts). This curriculum must guide the user dynamically.
CURRICULUM ARCHITECTURE:
Each Module must adhere to the following Dynamic Structure:
Module Title & Objective: A clear title and objective.
Conceptual Cornerstone: Core concepts.
Illuminating Examples: Diverse examples.
Actionable Inquiry (Interactive Element): Pose a stimulating question.
Conceptual Linkages: Connect concepts.
LENS Shift (Perspective): Examine through a different lens.
Visual Synthesis (Diagram): ALWAYS include a Mermaid diagram code block (using \`\`\`mermaid ... \`\`\`).
Progress Navigator: Display progress visually.

At every 4th module, include an interactive test. At every 5th module, analyze user understanding and adjust level. The FINAL module must always be a hands-on CAPSTONE PROJECT.

CRITICAL FORMATTING RULES:
1. NEVER use ASCII-art boxes, borders, or indented text blocks.
2. ALWAYS use standard Markdown tables (using | and -) for structured data or comparisons.
3. Keep paragraphs concise.
4. Maintain a handwritten notebook narrative style, and extensively use Mermaid flowcharts and diagrams for visual synthesis.

OPERATIONAL FLOW:
Wait for the user's domain and subject to commence. Deliver Module 1.`;

// Backend API URL
const BACKEND_URL = "http://localhost:3456/api/generate";

let chatHistory: any[] = [];
let aiInitialized = false;
let userDomain: string | null = null;
let userSubject: string | null = null;
let userLevel: string | null = null;
let maxModules = 8;
let modules: { raw: string, html: string }[] = [];
let currentModuleIndex = -1;
let isWaitingForAI = false;
let isLoggedIn = false;

// Listen for Supabase Auth state changes
supabase.auth.onAuthStateChange((event, session) => {
    isLoggedIn = !!session;
});

declare const mermaid: any;

// Execute immediately since type="module" is already deferred
try {
        // --- Dynamic Theme Switching ---
        const slides = document.querySelectorAll('.slide');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (entry.target.classList.contains('light-slide') || entry.target.classList.contains('tan-slide')) {
                        document.body.classList.add('theme-light');
                    } else {
                        document.body.classList.remove('theme-light');
                    }
                }
            });
        }, { 
            root: document.getElementById('slides-container'),
            threshold: 0.5 
        });
        slides.forEach(slide => observer.observe(slide));

        // --- Animations using Motion ---
        inView(".motion-element", (info: any) => {
            const targetElement = info.target || info;
            animate(targetElement, { opacity: [0, 1], scale: [0.85, 1], y: [30, 0] }, { duration: 0.6 } as any);
        });

        // --- DOM Elements ---
        const slidesContainer = document.getElementById('slides-container')!;
        const masterclassArea = document.getElementById('masterclass-area')!;
        const domainInput = document.getElementById('domain-input') as HTMLInputElement;
        const subjectInput = document.getElementById('subject-input') as HTMLInputElement;
        const levelSelect = document.getElementById('level-select') as HTMLSelectElement;
        
        // Add Markdown styles dynamically
        const generateBtn = document.getElementById('generate-btn') as HTMLButtonElement;
        const masterclassHeading = document.getElementById('masterclass-heading') as HTMLHeadingElement;
        const moduleContainer = document.getElementById('module-container')!;
        const prevModuleButton = document.getElementById('prev-module-button') as HTMLButtonElement;
        const nextModuleButton = document.getElementById('next-module-button') as HTMLButtonElement;
        const moduleCounterDisplay = document.getElementById('module-counter-display')!;
        
        const loginModal = document.getElementById('login-modal')!;
        const submitLoginBtn = document.getElementById('submit-login-btn') as HTMLButtonElement;
        const submitSignupBtn = document.getElementById('submit-signup-btn') as HTMLButtonElement;
        const loginEmail = document.getElementById('login-email') as HTMLInputElement;
        const loginPass = document.getElementById('login-pass') as HTMLInputElement;
        const authErrorMsg = document.getElementById('auth-error-msg') as HTMLDivElement;

        // Check initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            isLoggedIn = !!session;
        });

        function saveState() {
            const state = {
                userDomain, userSubject, userLevel, maxModules,
                modules, currentModuleIndex, chatHistory
            };
            localStorage.setItem('archon_state', JSON.stringify(state));
        }

        function loadState() {
            const stored = localStorage.getItem('archon_state');
            if (stored) {
                try {
                    const state = JSON.parse(stored);
                    userDomain = state.userDomain;
                    userSubject = state.userSubject;
                    userLevel = state.userLevel;
                    maxModules = state.maxModules;
                    modules = state.modules || [];
                    currentModuleIndex = state.currentModuleIndex;
                    chatHistory = state.chatHistory || [];

                    if (modules.length > 0) {
                        slidesContainer.classList.add('hidden');
                        masterclassArea.classList.remove('hidden');
                        masterclassHeading.textContent = `${userSubject} in ${userDomain} (${userLevel})`;
                        displayModule(currentModuleIndex >= 0 ? currentModuleIndex : 0);
                        return true;
                    }
                } catch (e) {
                    console.error("Failed to load state", e);
                }
            }
            return false;
        }

        function initializeAI() {
            // AI is now handled by the secure backend.
            aiInitialized = true;
            generateBtn.disabled = false;
        }

        generateBtn.addEventListener('click', () => {
            try {
                const domain = domainInput.value.trim();
                const subject = subjectInput.value.trim();
                const level = levelSelect.value;
                
                if (!domain || !subject) {
                    alert("Please fill out both Domain and Subject.");
                    return;
                }

                userDomain = domain;
                userSubject = subject;
                userLevel = level;
                maxModules = level === 'Low' ? 8 : (level === 'Intermediate' ? 16 : 24);

                // Check if user is logged in via Supabase
                if (!isLoggedIn) {
                    authErrorMsg.style.display = 'none';
                    loginModal.classList.remove('hidden');
                    return;
                }

                startMasterclass();
            } catch (err: any) {
                alert("Error in click handler: " + err.message);
            }
        });

        submitLoginBtn.addEventListener('click', async () => {
            const email = loginEmail.value.trim();
            const password = loginPass.value.trim();
            if (!email || !password) {
                showAuthError("Please enter both email and password.");
                return;
            }
            
            submitLoginBtn.disabled = true;
            submitLoginBtn.textContent = 'Logging in...';
            
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            
            submitLoginBtn.disabled = false;
            submitLoginBtn.textContent = 'Log In';

            if (error) {
                showAuthError(error.message);
            } else {
                loginModal.classList.add('hidden');
                startMasterclass();
            }
        });

        submitSignupBtn.addEventListener('click', async () => {
            const email = loginEmail.value.trim();
            const password = loginPass.value.trim();
            if (!email || !password) {
                showAuthError("Please enter both email and password.");
                return;
            }
            
            submitSignupBtn.disabled = true;
            submitSignupBtn.textContent = 'Signing up...';
            
            const { data, error } = await supabase.auth.signUp({ email, password });
            
            submitSignupBtn.disabled = false;
            submitSignupBtn.textContent = 'Sign Up';

            if (error) {
                showAuthError(error.message);
            } else if (data.session) {
                // Auto-login (email verification is likely disabled)
                loginModal.classList.add('hidden');
                startMasterclass();
            } else {
                // Email verification required
                showAuthError("Success! Please check your email to verify your account.", true);
            }
        });

        function showAuthError(msg: string, isSuccess = false) {
            authErrorMsg.textContent = msg;
            authErrorMsg.style.color = isSuccess ? '#10b981' : '#ef4444';
            authErrorMsg.style.display = 'block';
        }

        function startMasterclass() {
            // Update System Prompt
            ARCHON_SYSTEM_PROMPT = ARCHON_SYSTEM_PROMPT
                .replace("[INSERT DOMAIN NAME]", userDomain!)
                .replace("[INSERT SUBJECT NAME]", userSubject!)
                .replace("[INSERT LEVEL NAME]", userLevel!)
                .replace("[INSERT MODULE COUNT]", maxModules.toString());

            // Transition UI
            slidesContainer.classList.add('hidden');
            masterclassArea.classList.remove('hidden');
            masterclassHeading.textContent = `${userSubject} in ${userDomain} (${userLevel})`;
            
            initiateArchonChat();
        }

        async function initiateArchonChat() {
            if (!aiInitialized) return;
            const initialPrompt = `Initiate Masterclass Forge for Subject: ${userSubject} within Domain: ${userDomain}. Provide Module 1/${maxModules}.`;
            await fetchAndDisplayModule(initialPrompt);
        }

        async function fetchAndDisplayModule(prompt: string) {
            if (isWaitingForAI) return;
            isWaitingForAI = true;
            updateNavigationButtons();
            moduleCounterDisplay.textContent = "Processing...";
            
            try {
                chatHistory.push({ role: "user", content: prompt });
                
                const response = await fetch('/api/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        systemPrompt: ARCHON_SYSTEM_PROMPT,
                        chatHistory: chatHistory,
                        maxModules: maxModules
                    })
                });

                if (response.status === 429) {
                    // Rate limit hit -> Show Paywall Modal
                    const paywallModal = document.getElementById('paywall-modal');
                    if (paywallModal) paywallModal.classList.remove('hidden');
                    moduleCounterDisplay.textContent = "Limit Reached";
                    return;
                }

                if (!response.ok) {
                    throw new Error(`Server error: ${response.statusText}`);
                }

                const data = await response.json();
                const rawText = data.text;
                chatHistory.push({ role: "assistant", content: rawText });
                
                const newModuleHtml = parseAndStructureModule(rawText);
                modules.push({ raw: rawText, html: newModuleHtml });
                saveState();
                displayModule(modules.length - 1);
            } catch (error: any) {
                console.error(error);
                moduleCounterDisplay.textContent = "Error loading module.";
                alert("Fetch Error: " + error.message);
            } finally {
                isWaitingForAI = false;
                updateNavigationButtons();
            }
        }

        function displayModule(index: number) {
            currentModuleIndex = index;
            moduleContainer.innerHTML = '';
            const page = document.createElement('div');
            page.innerHTML = modules[index].html;
            moduleContainer.appendChild(page);
            
            moduleCounterDisplay.textContent = `Page ${index + 1} of ${maxModules}`;
            
            const renderBtns = page.querySelectorAll('.render-mermaid-button') as NodeListOf<HTMLButtonElement>;
            renderBtns.forEach(btn => btn.addEventListener('click', handleRenderMermaidClick));
            
            updateNavigationButtons();
        }

        function updateNavigationButtons() {
            prevModuleButton.classList.toggle('hidden', currentModuleIndex <= 0);
            nextModuleButton.classList.toggle('hidden', currentModuleIndex >= maxModules - 1);
            nextModuleButton.disabled = isWaitingForAI;
        }

        prevModuleButton.addEventListener('click', () => {
            if (currentModuleIndex > 0) displayModule(currentModuleIndex - 1);
        });

        nextModuleButton.addEventListener('click', () => {
            if (isWaitingForAI) return;
            const nextIndex = currentModuleIndex + 1;
            if (nextIndex < modules.length) {
                displayModule(nextIndex);
            } else {
                fetchAndDisplayModule(`Proceed to Module ${nextIndex + 1}.`);
            }
        });

        function parseAndStructureModule(rawText: string): string {
            let text = rawText;
            let mermaidHtml = "";
            
            const mermaidRegex = /```mermaid\s*([\s\S]*?)\s*```/i;
            const match = text.match(mermaidRegex);
            if (match) {
                const code = match[1].trim();
                mermaidHtml = `
                    <div class="mermaid-container">
                        <div class="mermaid-code-block" style="display:none;"><pre><code>${code}</code></pre></div>
                        <button class="render-mermaid-button">Show Diagram</button>
                        <div class="mermaid-diagram-output" style="display:none;"></div>
                    </div>
                `;
                text = text.replace(mermaidRegex, "%%MERMAID%%");
            }

            // Strip emojis
            text = text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2702}-\u{27B0}]/gu, '');

            // Use marked to parse all markdown (tables, lists, etc)
            let htmlContent = marked.parse(text) as string;
            
            let finalHtml = `<div class="module-content">${htmlContent}</div>`;
            if (mermaidHtml) finalHtml = finalHtml.replace("%%MERMAID%%", mermaidHtml);
            
            return finalHtml;
        }

        async function handleRenderMermaidClick(event: MouseEvent) {
            const btn = event.target as HTMLButtonElement;
            const container = btn.closest('.mermaid-container')!;
            const code = container.querySelector('code')!.textContent!;
            const output = container.querySelector('.mermaid-diagram-output') as HTMLElement;
            
            btn.textContent = 'Rendering...';
            btn.disabled = true;
            
            try {
                const id = 'mermaid-' + Date.now();
                const { svg } = await mermaid.render(id, code);
                output.innerHTML = svg;
                output.style.display = 'block';
                btn.style.display = 'none';
            } catch (e) {
                btn.textContent = 'Failed';
                output.innerHTML = 'Error rendering diagram.';
                output.style.display = 'block';
            }
        }

        if (!loadState()) {
            initializeAI();
        }
} catch (globalErr: any) {
    alert("CRITICAL ERROR ON LOAD: " + globalErr.message);
}
