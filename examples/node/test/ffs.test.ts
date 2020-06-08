import request from "supertest"
import app from "../src/app"

describe("GET /ffs", () => {
  it("should return 302 Found for redirection", () => {
    return request(app).get("/ffs").expect(302)
  })
})
