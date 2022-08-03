import {
  AuthTokenService,
  authTokenService,
} from "backend/lib/auth-token/auth-token.service";
import {
  createConfigDomainPersistenceService,
  AbstractConfigDataPersistenceService,
} from "backend/lib/config-persistence";
import { BadRequestError, ForbiddenError } from "backend/lib/errors";
import { HashService } from "backend/lib/hash/hash.service";
import { ISuccessfullAuthenticationResponse } from "shared/types";
import { IAccountUser } from "./users.types";

const INVALID_LOGIN_MESSAGE = "Invalid Login";

export class UsersService {
  constructor(
    private readonly _usersPersistenceService: AbstractConfigDataPersistenceService<IAccountUser>,
    private readonly _authTokenService: AuthTokenService
  ) {}

  async tryAuthenticate(authCrendetials: {
    username: string;
    password: string;
  }): Promise<ISuccessfullAuthenticationResponse> {
    const user = await this._usersPersistenceService.getItem(
      authCrendetials.username
    );

    if (!user) {
      throw new ForbiddenError(INVALID_LOGIN_MESSAGE);
    }
    if (!(await HashService.compare(authCrendetials.password, user.password))) {
      throw new ForbiddenError(INVALID_LOGIN_MESSAGE);
    }
    delete user.password; // :eyes
    return { token: this._authTokenService.sign(user) };
  }

  async registerUser(user: IAccountUser) {
    const userExists = await this._usersPersistenceService.getItem(
      user.username
    );
    if (userExists) {
      throw new BadRequestError("Username already exists");
    }
    await this._usersPersistenceService.upsertItem(user.username, {
      ...user,
      password: await HashService.make(user.password),
    });
  }

  async hasUsers() {
    return (await this._usersPersistenceService.getAllItems()).length > 0;
  }

  async removeUser(username: string) {
    await this._usersPersistenceService.removeItem(username);
  }

  async getUser(username: string) {
    return await this._usersPersistenceService.getItem(username);
  }

  async changePassword(
    username: string,
    input: {
      oldPassword: string;
      newPassword: string;
    }
  ) {
    const user = await this._usersPersistenceService.getItem(username);

    if (!(await HashService.compare(input.oldPassword, user.password))) {
      throw new BadRequestError("Incorrect password");
    }
    await this.updateUser(username, {
      password: await HashService.make(input.newPassword),
    });
  }

  async resetPassword(username: string, newPassword: string) {
    await this.updateUser(username, {
      password: await HashService.make(newPassword),
    });
  }

  async updateUser(username: string, userDetails: Partial<IAccountUser>) {
    const user = await this._usersPersistenceService.getItem(username);
    if (!user) {
      return;
    }
    await this._usersPersistenceService.upsertItem(username, {
      ...user,
      ...userDetails,
    });
  }
}

const usersPersistenceService =
  createConfigDomainPersistenceService<IAccountUser>("users");

export const usersService = new UsersService(
  usersPersistenceService,
  authTokenService
);