import request from "supertest"
import app from "../src/app"

describe("GET /user", () => {
  it("should return 302 Found for redirection", () => {
    return request(app).get("/user").expect(302)
  })
})
