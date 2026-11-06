import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import type { RawChatPerson } from "@/types";

const MAX_STACK = 3;

export function GroupAvatarStack({ members }: { members: RawChatPerson[] }) {
  const shown = members.slice(0, MAX_STACK);
  const hidden = members.length - shown.length;

  return (
    <AvatarGroup aria-hidden className="min-w-10 shrink-0 items-center">
      {shown.map((member) => (
        <Avatar key={member._id} title={member.name}>
          <AvatarImage src={member.profile_image} alt={member.name} />
          <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
        </Avatar>
      ))}

      {hidden > 0 ? <AvatarGroupCount>+{hidden}</AvatarGroupCount> : null}
    </AvatarGroup>
  );
}
