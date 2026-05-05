/**
 * HTTP client untuk komunikasi backend Express → FastAPI ML Service.
 */

const ML_SERVICE_URL  = process.env.ML_SERVICE_URL  ?? 'http://localhost:8000'
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY ?? ''

export interface DailyRecordInput {
  date: string
  actualProduction: number
  actualSales: number
  wasteAmount: number
}

export interface PredictRequest {
  menuId: string
  menuName: string
  targetDate: string
  history: DailyRecordInput[]
}

export interface PredictResult {
  menuId: string
  menuName: string
  targetDate: string
  predictedDemand: number
  confidenceLevel: number
  lowerBound: number
  upperBound: number
  method: string
  insight: string | null
}

export interface BulkPredictResponse {
  targetDate: string
  predictions: PredictResult[]
}

// ── Evaluate ─────────────────────────────────────────────────────────────────

export interface MenuEvalRequest {
  menuId: string
  menuName: string
  history: DailyRecordInput[]
}

export interface MenuMetrics {
  menuId: string
  menuName: string
  trainDays: number
  testDays: number
  mae: number
  rmse: number
  mape: number
  accuracy: number
  method: string
  predictions: {
    date: string
    actual: number
    predicted: number
    error: number
    errorPct: number
  }[]
}

export interface EvaluateResponse {
  totalMenus: number
  evaluatedMenus: number
  avgMae: number
  avgRmse: number
  avgMape: number
  avgAccuracy: number
  menus: MenuMetrics[]
}

// ── Shared fetch helper ───────────────────────────────────────────────────────

async function mlFetch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${ML_SERVICE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(INTERNAL_API_KEY ? { 'X-Api-Key': INTERNAL_API_KEY } : {}),
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(60_000), // evaluasi bisa lebih lama dari predict
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`ML service error ${res.status}: ${text}`)
  }

  return res.json() as Promise<T>
}

export async function predictBulk(
  menus: PredictRequest[],
  targetDate: string
): Promise<BulkPredictResponse> {
  return mlFetch<BulkPredictResponse>('/predict/bulk', { menus, targetDate })
}

export async function predictSingle(req: PredictRequest): Promise<PredictResult> {
  return mlFetch<PredictResult>('/predict/single', req)
}

export async function evaluateModel(
  menus: MenuEvalRequest[],
  testDays: number = 7
): Promise<EvaluateResponse> {
  return mlFetch<EvaluateResponse>('/evaluate', { menus, testDays })
}

export async function checkMLHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${ML_SERVICE_URL}/health`, {
      signal: AbortSignal.timeout(5_000),
    })
    return res.ok
  } catch {
    return false
  }
}
