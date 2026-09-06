// Pipeline pixel-art: renderiza la escena a un WebGLRenderTarget de baja
// resolución (ej. 320×180) y luego lo dibuja como un quad full-screen con
// NearestFilter. Todo lo que se ve en pantalla pasa por aquí.

import * as THREE from 'three';

export interface PixelationOptions {
  /** Resolución lógica del render objetivo. */
  width: number;
  height: number;
}

export class PixelationPass {
  readonly renderTarget: THREE.WebGLRenderTarget;

  private readonly presentScene: THREE.Scene;
  private readonly presentCamera: THREE.OrthographicCamera;
  private readonly presentMaterial: THREE.MeshBasicMaterial;
  private readonly presentQuad: THREE.Mesh;

  constructor(options: PixelationOptions) {
    this.renderTarget = new THREE.WebGLRenderTarget(options.width, options.height, {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      generateMipmaps: false,
      depthBuffer: true,
      stencilBuffer: false,
    });
    this.renderTarget.texture.colorSpace = THREE.SRGBColorSpace;

    this.presentScene = new THREE.Scene();
    this.presentCamera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0, 1);
    this.presentMaterial = new THREE.MeshBasicMaterial({
      map: this.renderTarget.texture,
      depthTest: false,
      depthWrite: false,
    });
    this.presentQuad = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), this.presentMaterial);
    this.presentScene.add(this.presentQuad);
  }

  resizeVirtual(width: number, height: number): void {
    this.renderTarget.setSize(width, height);
  }

  present(renderer: THREE.WebGLRenderer): void {
    renderer.setRenderTarget(null);
    renderer.render(this.presentScene, this.presentCamera);
  }

  dispose(): void {
    this.renderTarget.dispose();
    this.presentMaterial.dispose();
    (this.presentQuad.geometry as THREE.BufferGeometry).dispose();
  }
}
