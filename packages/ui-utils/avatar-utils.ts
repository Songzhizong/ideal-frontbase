import avatar1 from "./assets/avatars/avatar-1.svg"
import avatar2 from "./assets/avatars/avatar-2.svg"
import avatar3 from "./assets/avatars/avatar-3.svg"
import avatar4 from "./assets/avatars/avatar-4.svg"
import avatar5 from "./assets/avatars/avatar-5.svg"
import avatar6 from "./assets/avatars/avatar-6.svg"
import avatar7 from "./assets/avatars/avatar-7.svg"
import avatar8 from "./assets/avatars/avatar-8.svg"

const defaultAvatars = [avatar1, avatar2, avatar3, avatar4, avatar5, avatar6, avatar7, avatar8]

/**
 * 简单的哈希函数，将字符串映射为数字
 */
function hashString(str: string): number {
  let hash = 0
  if (str.length === 0) return hash
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash |= 0 // 转换为 32 位整数
  }
  return Math.abs(hash)
}

/**
 * 根据用户 ID 获取固定的头像
 * @param userId 用户 ID
 * @param avatars 可选头像列表（用于应用层覆盖）
 * @returns 头像路径
 */
export function getAvatarByHash(
  userId: string | undefined | null,
  avatars?: ReadonlyArray<string>,
): string | undefined {
  const sourceAvatars = avatars?.length ? avatars : defaultAvatars
  if (sourceAvatars.length === 0) return undefined

  const hash = hashString(userId || "")
  const index = hash % sourceAvatars.length
  return sourceAvatars[index]
}
