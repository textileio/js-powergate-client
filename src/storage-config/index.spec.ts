// import {
//   JobStatus,
//   JobStatusMap,
//   StorageConfig,
// } from "@textile/grpc-powergate-client/dist/proto/powergate/v1/powergate_pb"
// import { expect } from "chai"
// import fs from "fs"
// import { createStorageConfig } from "."
// import { createAdmin } from "../admin"
// import { getTransport, host, useTokens } from "../util"
// import { ApplyOptions } from "./types"

// describe("storage config", function () {
//   this.timeout(180000)

//   const { getMeta, _, setToken } = useTokens("")

//   const c = createStorageConfig({ host, transport: getTransport() }, getMeta)
//   const a = createAdmin({ host, transport: getTransport() })

//   it("should get the default config", async () => {
//     await expectNewInstance()
//     await expectDefaultStorageConfig()
//   })

//   it("should set default config", async () => {
//     await expectNewInstance()
//     const defaultConfig = await expectDefaultStorageConfig()
//     await c.setDefault(defaultConfig)
//   })

//   it("should apply config", async () => {
//     await expectNewInstance()
//     const cid = await expectStage("sample-data/samplefile")
//     const config = await expectDefaultStorageConfig()
//     await expectPushStorageConfig(cid, { override: false, storageConfig: config })
//   })

//   it("should remove", async () => {
//     await expectNewInstance()
//     const cid = await expectStage("sample-data/samplefile")
//     const conf: StorageConfig.AsObject = {
//       repairable: false,
//       cold: {
//         enabled: false,
//       },
//       hot: {
//         allowUnfreeze: false,
//         enabled: false,
//         unfreezeMaxPrice: 0,
//       },
//     }
//     const jobId = await expectPushStorageConfig(cid, { override: false, storageConfig: conf })
//     await waitForJobStatus(jobId, JobStatus.JOB_STATUS_SUCCESS)
//     await c.remove(cid)
//   })

//   async function expectNewInstance() {
//     const res = await a.profiles.createStorageProfile()
//     expect(res.authEntry?.id).not.empty
//     expect(res.authEntry?.token).not.empty
//     // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
//     setToken(res.authEntry!.token)
//     return res
//   }

//   async function expectDefaultStorageConfig() {
//     const res = await c.default()
//     expect(res.defaultStorageConfig).not.undefined
//     // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
//     return res.defaultStorageConfig!
//   }

//   async function expectStage(path: string) {
//     const buffer = fs.readFileSync(path)
//     const res = await c.stage(buffer)
//     expect(res.cid).length.greaterThan(0)
//     return res.cid
//   }

//   async function expectPushStorageConfig(cid: string, opts?: ApplyOptions) {
//     const res = await c.apply(cid, opts)
//     expect(res.jobId).length.greaterThan(0)
//     return res.jobId
//   }

//   function waitForJobStatus(jobId: string, status: JobStatusMap[keyof JobStatusMap]) {
//     return new Promise<void>((resolve, reject) => {
//       try {
//         const cancel = c.watchJobs((job) => {
//           if (job.errCause.length > 0) {
//             reject(job.errCause)
//           }
//           if (job.status === JobStatus.JOB_STATUS_CANCELED) {
//             reject("job canceled")
//           }
//           if (job.status === JobStatus.JOB_STATUS_FAILED) {
//             reject("job failed")
//           }
//           if (job.status === status) {
//             cancel()
//             resolve()
//           }
//         }, jobId)
//       } catch (e) {
//         reject(e)
//       }
//     })
//   }
// })
