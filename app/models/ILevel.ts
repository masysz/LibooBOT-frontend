import { Level as LevelEnum } from "../enums/ILevel"

export type Level = {
    level: LevelEnum,
    fee: number,
}

export type MultiLevelRequest = {
    level: LevelEnum,
    userId: string,
}