/**
 * Townscaper-Style Toon Shader
 * Creates cel-shaded look with black outlines
 */

export const ToonVertexShader = `
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const ToonFragmentShader = `
  uniform vec3 color;
  uniform vec3 lightDirection;
  
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  
  void main() {
    // Cel shading with 4 levels
    vec3 normal = normalize(vNormal);
    vec3 lightDir = normalize(lightDirection);
    
    float NdotL = dot(normal, lightDir);
    
    // Quantize lighting into bands (toon shading)
    float intensity;
    if (NdotL > 0.95) {
      intensity = 1.0;
    } else if (NdotL > 0.5) {
      intensity = 0.7;
    } else if (NdotL > 0.05) {
      intensity = 0.4;
    } else {
      intensity = 0.2;
    }
    
    // Apply color with cel-shaded lighting
    vec3 finalColor = color * intensity;
    
    // Add slight ambient
    finalColor += color * 0.1;
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export const OutlineVertexShader = `
  uniform float outlineThickness;
  
  void main() {
    vec3 newPosition = position + normal * outlineThickness;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

export const OutlineFragmentShader = `
  void main() {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); // Black outline
  }
`;
