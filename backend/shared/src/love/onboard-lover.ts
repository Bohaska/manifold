import { createSupabaseDirectClient } from 'shared/supabase/init'
import {
  addUsersToPrivateMessageChannel,
  insertPrivateMessage,
  joinChatContent,
} from 'shared/supabase/private-messages'
import { User } from 'common/user'
import { track } from 'shared/analytics'
import { manifoldLoveRelationshipsGroupId } from 'common/love/constants'
import { log } from 'shared/utils'
import { addUserToGroup } from 'shared/supabase/groups'

export const onboardLover = async (user: User, ip: string) => {
  const pg = createSupabaseDirectClient()

  try {
    await addUserToGroup(manifoldLoveRelationshipsGroupId, user.id, user.id)
  } catch (e) {
    log('Error adding user to group', e)
  }
  const publicChannels = await pg.manyOrNone(
    `select id from private_user_message_channels where title is not null
          and id not in (select channel_id from private_user_message_channel_members where user_id = $1)`,
    [user.id]
  )
  log('Adding lover to public channels:', publicChannels)
  await Promise.all(
    publicChannels.map(async (pc) => {
      await addUsersToPrivateMessageChannel([user.id], pc.id, pg)
      await insertPrivateMessage(
        joinChatContent(user.name),
        pc.id,
        user.id,
        'system_status',
        pg
      )
    })
  )

  await track(user.id, 'create lover', { username: user.username }, { ip })
}
