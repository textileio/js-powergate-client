import { grpc } from "@improbable-eng/grpc-web"
import {
  CreateUserRequest,
  CreateUserResponse,
  UsersRequest,
  UsersResponse,
} from "@textile/grpc-powergate-client/dist/powergate/admin/v1/admin_pb"
import { AdminServiceClient } from "@textile/grpc-powergate-client/dist/powergate/admin/v1/admin_pb_service"
import { Config } from "../../types"
import { promise } from "../../util"

export interface AdminUsers {
  /**
   * Create a new user.
   * @returns Information about the new user.
   */
  create: () => Promise<CreateUserResponse.AsObject>

  /**
   * List all users.
   * @returns A list of all users.
   */
  list: () => Promise<UsersResponse.AsObject>
}

/**
 * @ignore
 */
export const createUsers = (config: Config, getMeta: () => grpc.Metadata): AdminUsers => {
  const client = new AdminServiceClient(config.host, config)
  return {
    create: () => {
      return promise(
        (cb) => client.createUser(new CreateUserRequest(), getMeta(), cb),
        (resp: CreateUserResponse) => resp.toObject(),
      )
    },

    list: () =>
      promise(
        (cb) => client.users(new UsersRequest(), getMeta(), cb),
        (resp: UsersResponse) => resp.toObject(),
      ),
  }
}
