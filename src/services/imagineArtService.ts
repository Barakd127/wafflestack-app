import axios from 'axios'

/**
 * ImagineArt Service
 * Documentation: https://docs.imagine.art
 * 
 * This service handles communication with ImagineArt API to generate
 * textures, references, and concept art based on text prompts.
 */

const IMAGINE_API_BASE = 'https://api.imagine.art/v1'

interface ImagineConfig {
  apiKey: string
}

interface GenerateTextureParams {
  prompt: string
  style?: 'realistic' | 'artistic' | 'stylized' | 'pbr'
  resolution?: '512x512' | '1024x1024' | '2048x2048'
  negative_prompt?: string
}

interface ImagineResponse {
  taskId: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  imageUrl?: string
  error?: string
}

class ImagineArtService {
  private apiKey: string

  constructor(config: ImagineConfig) {
    this.apiKey = config.apiKey
  }

  /**
   * Generate a texture or concept art from a text prompt
   * @param params - Generation parameters
   * @returns Task ID and status
   */
  async generateTexture(params: GenerateTextureParams): Promise<ImagineResponse> {
    try {
      const response = await axios.post(
        `${IMAGINE_API_BASE}/generate`,
        {
          prompt: params.prompt,
          style: params.style || 'realistic',
          resolution: params.resolution || '1024x1024',
          negative_prompt: params.negative_prompt,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      )

      return {
        taskId: response.data.task_id,
        status: response.data.status,
        imageUrl: response.data.image_url,
      }
    } catch (error) {
      console.error('ImagineArt Error:', error)
      return {
        taskId: '',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Check the status of a generation task
   * @param taskId - The task ID to check
   * @returns Current status and image URL if completed
   */
  async checkStatus(taskId: string): Promise<ImagineResponse> {
    try {
      const response = await axios.get(
        `${IMAGINE_API_BASE}/task/${taskId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
          },
        }
      )

      return {
        taskId: response.data.task_id,
        status: response.data.status,
        imageUrl: response.data.image_url,
      }
    } catch (error) {
      console.error('ImagineArt Status Check Error:', error)
      return {
        taskId,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Generate PBR texture maps (albedo, normal, roughness, metallic, AO)
   * @param prompt - Description of the material
   * @returns Task ID for the PBR generation
   */
  async generatePBRMaps(prompt: string): Promise<ImagineResponse> {
    return this.generateTexture({
      prompt: `${prompt}, PBR material, seamless texture`,
      style: 'pbr',
      resolution: '2048x2048',
    })
  }

  /**
   * Download the generated image
   * @param imageUrl - URL of the generated image
   * @returns Blob of the image file
   */
  async downloadImage(imageUrl: string): Promise<Blob | null> {
    try {
      const response = await axios.get(imageUrl, {
        responseType: 'blob',
      })
      return response.data
    } catch (error) {
      console.error('Image Download Error:', error)
      return null
    }
  }
}

// Export a singleton instance (configure with your API key)
export const imagineArtService = new ImagineArtService({
  apiKey: import.meta.env.VITE_IMAGINE_API_KEY || 'your-api-key-here',
})

export default ImagineArtService
