import { CreateStorageProfileResponse } from "@textile/grpc-powergate-client/dist/proto/admin/v1/powergate_admin_pb"
import { expect } from "chai"
import { Profiles } from "./admin/profiles"

export async function expectNewInstance(
  p: Profiles,
  setToken: (t: string) => void,
): Promise<CreateStorageProfileResponse.AsObject> {
  const res = await p.createStorageProfile()
  expect(res.authEntry?.id).not.empty
  expect(res.authEntry?.token).not.empty
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  setToken(res.authEntry!.token)
  return res
}

// async function expectAddrs(length: number) {
//   const res = await c.addrs()
//   expect(res.addrsList).length(length)
//   return res.addrsList
// }

// async function expectNewAddr() {
//   const res = await c.newAddr("my addr")
//   expect(res.addr).length.greaterThan(0)
//   return res.addr
// }

// async function expectDefaultStorageConfig() {
//   const res = await c.defaultStorageConfig()
//   expect(res.defaultStorageConfig).not.undefined
//   // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
//   return res.defaultStorageConfig!
// }

// async function expectStage(path: string) {
//   const buffer = fs.readFileSync(path)
//   const res = await c.stage(buffer)
//   expect(res.cid).length.greaterThan(0)
//   return res.cid
// }

// async function expectPushStorageConfig(cid: string, opts?: PushStorageConfigOptions) {
//   const res = await c.pushStorageConfig(cid, opts)
//   expect(res.jobId).length.greaterThan(0)
//   return res.jobId
// }

// function waitForJobStatus(jobId: string, status: JobStatusMap[keyof JobStatusMap]) {
//   return new Promise<void>((resolve, reject) => {
//     try {
//       const cancel = c.watchJobs((job) => {
//         if (job.errCause.length > 0) {
//           reject(job.errCause)
//         }
//         if (job.status === JobStatus.JOB_STATUS_CANCELED) {
//           reject("job canceled")
//         }
//         if (job.status === JobStatus.JOB_STATUS_FAILED) {
//           reject("job failed")
//         }
//         if (job.status === status) {
//           cancel()
//           resolve()
//         }
//       }, jobId)
//     } catch (e) {
//       reject(e)
//     }
//   })
// }

// function waitForBalance(address: string, greaterThan: number) {
//   return new Promise<number>(async (resolve, reject) => {
//     while (true) {
//       try {
//         const res = await c.info()
//         if (!res.info) {
//           reject("no balance info returned")
//           return
//         }
//         const info = res.info.balancesList.find((info) => info.addr?.addr === address)
//         if (!info) {
//           reject("address not in balances list")
//           return
//         }
//         if (info.balance > greaterThan) {
//           resolve(info.balance)
//           return
//         }
//       } catch (e) {
//         reject(e)
//       }
//       await new Promise((r) => setTimeout(r, 1000))
//     }
//   })
// }
// })
