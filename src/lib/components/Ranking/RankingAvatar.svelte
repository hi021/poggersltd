<script lang="ts">
  import { getAvatarURL, getOsuProfileURL, tooltip } from "$lib/util";
  interface Props {
    id: number; // player osu id
  }

  let { id }: Props = $props();
</script>

<td class="hide-width-640" style="width: 36px;">
  <a
    class="osu-avatar-small"
    href={getOsuProfileURL(id)}
    target="_blank"
    rel="noreferrer"
    use:tooltip={{ content: "osu! profile" }}
    style="display: block;">
    <img class="osu-avatar-small" height="36" width="36" alt="" src={getAvatarURL(id)} />
  </a>
</td>
