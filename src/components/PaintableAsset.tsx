import React, { useMemo, useLayoutEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface PaintableAssetProps {
  url: string;
  color?: string;
  [key: string]: any;
}

export function PaintableAsset({ url, color, ...props }: PaintableAssetProps) {
  const { scene } = useGLTF(url);

  // 1. Deep Clone the Scene per instance
  const clonedScene = useMemo(() => scene.clone(true), [scene]);

  useLayoutEffect(() => {
    // 2. Traverse and Paint
    const DEBUG_ASSET = false
    clonedScene.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        const mesh = node as THREE.Mesh;

        // DEBUG: Set DEBUG_ASSET = true to see internal names in Console F12
        if (DEBUG_ASSET) {
          console.log("Found mesh:", mesh.name, "Material:", (mesh.material as THREE.Material).name);
        }

        // 3. CRITICAL: Clone material to detach from global cache
        if (Array.isArray(mesh.material)) {
          mesh.material = mesh.material.map((m) => m.clone());
        } else {
          mesh.material = mesh.material.clone();
        }

        // 4. Apply Color
        // If the user supplied a color, override the existing one.
        if (color) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((mat) => {
              if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshBasicMaterial) {
                mat.color.set(color);
                
                // OPTIONAL: Boost brightness if Kenney models look dark
                if (mat instanceof THREE.MeshStandardMaterial) {
                  mat.emissive.set(color);
                  mat.emissiveIntensity = 0.2;
                }
              }
            });
          } else {
            const mat = mesh.material as THREE.MeshStandardMaterial;
            if (mat.color) {
              mat.color.set(color);
              
              // OPTIONAL: Boost brightness if Kenney models look dark
              if (mat.emissive) {
                mat.emissive.set(color);
                mat.emissiveIntensity = 0.2;
              }
            }
          }
        }
      }
    });
  }, [clonedScene, color]);

  return <primitive object={clonedScene} {...props} />;
}
