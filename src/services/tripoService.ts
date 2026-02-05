import axios from 'axios'

/**
 * TripoAI Service
 * Documentation: https://platform.tripo3d.ai
 * 
 * This service handles communication with TripoAI API to generate 3D models
 * from image URLs or text prompts.
 */

const TRIPO_API_BASE = 'https://api.tripo3d.ai/v1'

interface TripoConfig {
  apiKey: string
}

interface GenerateModelParams {
  imageUrl?: string
  prompt?: string
  style?: 'realistic' | 'stylized' | 'low-poly'
}

interface TripoResponse {
  taskId: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  modelUrl?: string
  error?: string
}

class TripoService {
  private apiKey: string

  constructor(config: TripoConfig) {
    this.apiKey = config.apiKey
  }

  /**
   * Generate a 3D model from an image URL
   * @param params - Generation parameters
   * @returns Task ID and status
   */
  async generateModel(params: GenerateModelParams): Promise<TripoResponse> {
    try {
      const response = await axios.post(
        `${TRIPO_API_BASE}/generate`,
        {
          image_url: params.imageUrl,
          prompt: params.prompt,
          style: params.style || 'realistic',
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
        modelUrl: response.data.model_url,
      }
    } catch (error) {
      console.error('TripoAI Error:', error)
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
   * @returns Current status and model URL if completed
   */
  async checkStatus(taskId: string): Promise<TripoResponse> {
    try {
      const response = await axios.get(
        `${TRIPO_API_BASE}/task/${taskId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
          },
        }
      )

      return {
        taskId: response.data.task_id,
        status: response.data.status,
        modelUrl: response.data.model_url,
      }
    } catch (error) {
      console.error('TripoAI Status Check Error:', error)
      return {
        taskId,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Download the generated .glb model
   * @param modelUrl - URL of the generated model
   * @returns Blob of the model file
   */
  async downloadModel(modelUrl: string): Promise<Blob | null> {
    try {
      const response = await axios.get(modelUrl, {
        responseType: 'blob',
      })
      return response.data
    } catch (error) {
      console.error('Model Download Error:', error)
      return null
    }
  }
}

// Export a singleton instance (configure with your API key)
export const tripoService = new TripoService({
  apiKey: import.meta.env.VITE_TRIPO_API_KEY || 'your-api-key-here',
})

export default TripoService
