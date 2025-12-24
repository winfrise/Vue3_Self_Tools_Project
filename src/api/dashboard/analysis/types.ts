export type AnalysisTotalTypes = {
  users: number
  messages: number
  moneys: number
  shoppings: number
}

export type UserAccessSource = {
  cname: string,
  value: number
  name: string
}

export type WeeklyUserActivity = {
  cname: string,
  value: number
  name: string
}

export type MonthlySales = {
  cname: string
  name: string
  estimate: number
  actual: number
}
