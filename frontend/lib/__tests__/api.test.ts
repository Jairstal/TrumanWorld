import {
  getRun,
  listRuns,
  getTimeline,
  getWorld,
  getAgent,
  listAgents,
  createRun,
  startRun,
  pauseRun,
  resumeRun,
  advanceRunTick,
  injectDirectorEvent,
  type RunSummary,
  type TimelineEvent,
  type WorldSnapshot,
  type AgentDetails,
} from '@/lib/api'

// Mock fetch
global.fetch = jest.fn()

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

describe('API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getRun', () => {
    it('returns run data on success', async () => {
      const mockRun: RunSummary = { id: '1', name: 'Test', status: 'running' }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockRun,
      } as Response)

      const result = await getRun('1')
      expect(result).toEqual(mockRun)
    })

    it('returns null on error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      } as Response)

      const result = await getRun('1')
      expect(result).toBeNull()
    })

    it('returns null on network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const result = await getRun('1')
      expect(result).toBeNull()
    })
  })

  describe('listRuns', () => {
    it('returns runs array on success', async () => {
      const mockRuns: RunSummary[] = [
        { id: '1', name: 'Run 1', status: 'running' },
        { id: '2', name: 'Run 2', status: 'paused' },
      ]
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockRuns,
      } as Response)

      const result = await listRuns()
      expect(result).toEqual(mockRuns)
    })

    it('returns empty array on error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      } as Response)

      const result = await listRuns()
      expect(result).toEqual([])
    })
  })

  describe('getTimeline', () => {
    it('returns timeline on success', async () => {
      const mockTimeline = {
        run_id: '1',
        events: [
          { id: 'e1', tick_no: 1, event_type: 'talk', payload: {} },
        ] as TimelineEvent[],
      }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTimeline,
      } as Response)

      const result = await getTimeline('1')
      expect(result).toEqual(mockTimeline)
    })

    it('returns empty events on error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      } as Response)

      const result = await getTimeline('1')
      expect(result).toEqual({ run_id: '1', events: [] })
    })
  })

  describe('createRun', () => {
    it('posts with correct body', async () => {
      const mockResponse = { id: '1', name: 'Test', status: 'created' }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      const result = await createRun('Test', true)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/runs'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'Test', seed_demo: true }),
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('returns null on error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      } as Response)

      const result = await createRun('Test')
      expect(result).toBeNull()
    })
  })

  describe('startRun', () => {
    it('calls correct endpoint', async () => {
      const mockRun: RunSummary = { id: '1', name: 'Test', status: 'running' }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockRun,
      } as Response)

      await startRun('1')
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/runs/1/start'),
        expect.objectContaining({ method: 'POST' })
      )
    })
  })

  describe('pauseRun', () => {
    it('calls correct endpoint', async () => {
      const mockRun: RunSummary = { id: '1', name: 'Test', status: 'paused' }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockRun,
      } as Response)

      await pauseRun('1')
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/runs/1/pause'),
        expect.objectContaining({ method: 'POST' })
      )
    })
  })

  describe('resumeRun', () => {
    it('calls correct endpoint', async () => {
      const mockRun: RunSummary = { id: '1', name: 'Test', status: 'running' }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockRun,
      } as Response)

      await resumeRun('1')
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/runs/1/resume'),
        expect.objectContaining({ method: 'POST' })
      )
    })
  })

  describe('injectDirectorEvent', () => {
    it('posts with event data', async () => {
      const mockResponse = { run_id: '1', status: 'ok' }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      const eventData = {
        event_type: 'announcement',
        payload: { message: 'Hello' },
        importance: 5,
      }

      await injectDirectorEvent('1', eventData)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/runs/1/director/events'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(eventData),
        })
      )
    })
  })
})
