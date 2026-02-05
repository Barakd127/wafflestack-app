/**
 * Bilinear Deformation Shader
 * Deforms square meshes to fit irregular quadrilateral grid cells
 * Implements Townscaper's "Square Peg in Round Hole" solution
 */

export const DeformationVertexShader = `
  // Grid cell corner positions (world space)
  uniform vec3 cornerA;  // Bottom-left
  uniform vec3 cornerB;  // Bottom-right  
  uniform vec3 cornerC;  // Top-right
  uniform vec3 cornerD;  // Top-left
  
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  // Bilinear interpolation
  vec3 bilinearInterpolate(vec3 p00, vec3 p10, vec3 p11, vec3 p01, vec2 uv) {
    // Interpolate bottom edge
    vec3 bottom = mix(p00, p10, uv.x);
    // Interpolate top edge
    vec3 top = mix(p01, p11, uv.x);
    // Interpolate between edges
    return mix(bottom, top, uv.y);
  }
  
  void main() {
    // Get UV coordinates (0-1 range) from vertex position
    // Assuming the input mesh is a unit square/cube
    vec2 uv = vec2(position.x, position.z);
    
    // Perform bilinear deformation
    vec3 deformedPos = bilinearInterpolate(
      cornerA,  // 0,0
      cornerB,  // 1,0
      cornerC,  // 1,1
      cornerD,  // 0,1
      uv
    );
    
    // Preserve Y (height)
    deformedPos.y += position.y;
    
    // Calculate deformed normal for proper lighting
    // Approximate using finite differences
    vec2 duv = vec2(0.01, 0.01);
    vec3 pos_dx = bilinearInterpolate(cornerA, cornerB, cornerC, cornerD, uv + vec2(duv.x, 0.0));
    vec3 pos_dy = bilinearInterpolate(cornerA, cornerB, cornerC, cornerD, uv + vec2(0.0, duv.y));
    
    vec3 tangent = normalize(pos_dx - deformedPos);
    vec3 bitangent = normalize(pos_dy - deformedPos);
    vec3 deformedNormal = normalize(cross(tangent, bitangent));
    
    vNormal = normalMatrix * deformedNormal;
    vPosition = deformedPos;
    
    gl_Position = projectionMatrix * viewMatrix * vec4(deformedPos, 1.0);
  }
`;

export const DeformationFragmentShader = `
  uniform vec3 color;
  uniform vec3 lightDirection;
  
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    // Toon shading
    vec3 normal = normalize(vNormal);
    vec3 lightDir = normalize(lightDirection);
    
    float NdotL = dot(normal, lightDir);
    
    // Quantize into bands
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
    
    vec3 finalColor = color * intensity;
    finalColor += color * 0.1;  // Ambient
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

// Outline shader remains the same as ToonShader
export { OutlineVertexShader, OutlineFragmentShader } from './ToonShader'
