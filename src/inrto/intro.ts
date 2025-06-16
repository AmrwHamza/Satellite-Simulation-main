import * as THREE from "three";
// intro.ts
import { OrbitControls } from "three/examples/jsm/Addons.js";
import "./intro.css";
import { cameraManeger, controls, scene } from "../main";
import { renderer } from "../main";

export class IntroOverlay {
  private overlay: HTMLDivElement;
  private startCallback: () => void;

  constructor(onStart: () => void) {
    this.startCallback = onStart;
    this.createOverlay();
    this.setupEventListeners();
  }

  private createOverlay(): void {
    this.overlay = document.createElement("div");
    this.overlay.id = "intro-overlay";
    this.overlay.className = "intro-overlay";

    this.createFloatingMoons();

    const content = document.createElement("div");
    content.className = "intro-content";

    const title = document.createElement("h1");
    title.className = "intro-title";
    title.innerHTML =
      'Satellite<br><span class="title-accent">Orbital Simulation</span>';

    const subtitle = document.createElement("p");
    subtitle.className = "intro-subtitle";
    subtitle.textContent =
      "A real-time 3D visualization of satellite physics and Earth orbit mechanics";

    const featuresContainer = document.createElement("div");
    featuresContainer.className = "intro-features-container";

    const featuresTitle = document.createElement("h3");
    featuresTitle.className = "features-title";
    featuresTitle.textContent = "Key Physical Concepts Simulated";

    const featuresList = document.createElement("div");
    featuresList.className = "intro-features";

    const features = [
      {
        icon: "🛰️",
        title: "Orbital Simulation",
        desc: "Track satellite movement in real-time Earth orbit",
      },
      {
        icon: "🌍",
        title: "Earth Gravity Field",
        desc: "Model gravitational forces acting on satellites",
      },
      {
        icon: "🚀",
        title: "Physics-Based Motion",
        desc: "Simulate realistic velocity, drag, and momentum",
      },
      {
        icon: "🔭",
        title: "Educational Study Tool",
        desc: "Visualize and learn orbital physics interactively",
      },
    ];

    features.forEach((feature, index) => {
      const featureCard = document.createElement("div");
      featureCard.className = "feature-card";
      featureCard.style.animationDelay = `${index * 0.2}s`;
      featureCard.innerHTML = `
                <div class="feature-icon">${feature.icon}</div>
                <div class="feature-content">
                    <h4>${feature.title}</h4>
                    <p>${feature.desc}</p>
                </div>
            `;
      featuresList.appendChild(featureCard);
    });

    const buttonContainer = document.createElement("div");
    buttonContainer.className = "intro-buttons";

    const simulationButton = document.createElement("button");
    simulationButton.className = "intro-button simulation-btn";
    simulationButton.innerHTML = `
            <span class="button-icon">🚀</span>
            <span class="button-text">Start Simulation</span>
        `;
    simulationButton.id = "start-simulation-btn";

    const pdfButton = document.createElement("button");
    pdfButton.className = "intro-button pdf-btn";
    pdfButton.innerHTML = `
            <span class="button-icon">📘</span>
            <span class="button-text">Open Study Guide</span>
        `;
    pdfButton.id = "open-pdf-btn";

    const loadingDiv = document.createElement("div");
    loadingDiv.className = "intro-loading";
    loadingDiv.id = "loading-indicator";
    loadingDiv.innerHTML = `
            <div class="loading-spinner"></div>
            <p>Launching Earth orbital physics simulation...</p>
        `;

    buttonContainer.appendChild(simulationButton);
    buttonContainer.appendChild(pdfButton);

    featuresContainer.appendChild(featuresTitle);
    featuresContainer.appendChild(featuresList);

    content.appendChild(title);
    content.appendChild(subtitle);
    content.appendChild(featuresContainer);
    content.appendChild(buttonContainer);
    content.appendChild(loadingDiv);

    this.overlay.appendChild(content);
    document.body.appendChild(this.overlay);
  }

  private createFloatingMoons(): void {
    // Create multiple floating moon elements
    const moonCount = 3;
    for (let i = 0; i < moonCount; i++) {
      const moon = document.createElement("div");
      moon.className = `floating-moon moon-${i + 1}`;
      this.overlay.appendChild(moon);
    }

    const particleCount = 8;
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div");
      particle.className = "plant-particle";
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      particle.style.animationDelay = `${Math.random() * 10}s`;
      particle.textContent = ["🌏", "🌌", "🚀", "🛰️"][
        Math.floor(Math.random() * 4)
      ];
      this.overlay.appendChild(particle);
    }
  }

  private setupEventListeners(): void {
    const simulationButton = document.getElementById(
      "start-simulation-btn"
    ) as HTMLButtonElement;
    const loadingIndicator = document.getElementById(
      "loading-indicator"
    ) as HTMLDivElement;

    simulationButton.addEventListener("click", () => {
      simulationButton.style.display = "none";
      pdfButton.style.display = "none";
      loadingIndicator.style.display = "block";

      setTimeout(() => {
        this.startSimulation();
      }, 2000);
    });

    const pdfButton = document.getElementById(
      "open-pdf-btn"
    ) as HTMLButtonElement;

    const link = document.createElement("a");
    link.href = "file:///C:/Users/hp/Downloads/Documents/BRD.pdf";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = pdfButton.textContent ?? "Open PDF";
    link.className = pdfButton.className; // copy classes if needed

    pdfButton.replaceWith(link);

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && this.overlay.style.display !== "none") {
        this.startSimulation();
      }
    });

    [simulationButton, pdfButton].forEach((button) => {
      button.addEventListener("mouseenter", () => {
        button.style.transform = "translateY(-3px) scale(1.05)";
      });

      button.addEventListener("mouseleave", () => {
        button.style.transform = "translateY(0) scale(1)";
      });
    });
  }

  private startSimulation(): void {
    this.overlay.classList.add("fade-out");

    setTimeout(() => {
      this.overlay.remove();
      this.startCallback();
    }, 100);
  }

  public show(): void {
    this.overlay.style.display = "flex";
    this.overlay.classList.remove("fade-out");
  }

  public hide(): void {
    this.overlay.style.display = "none";
  }
}

export function initializeSimulation(this: any): void {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.debug.checkShaderErrors = true;
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  document.body.appendChild(renderer.domElement);
  const controls = new OrbitControls(cameraManeger.camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.enablePan = false;
  controls.update();
  renderSingleFrame();
}

function renderSingleFrame(): void {
  renderer.render(scene.scene, cameraManeger.camera);
  controls.update();
}

// const intro = new IntroOverlay(
//   () => initializeSimulation(),  // Simulation callback
//   () => window.open('path/to/your/file.pdf', '_blank')  
// );
