<script lang="ts">
  import { getAvatarURL, tooltip } from "$lib/util";
  export let id: number; // player osu id
</script>

<td class="hide-width-640" style="width: 36px;">
  <a
    class="osu-avatar-small"
    href="https://osu.ppy.sh/users/{id}"
    target="_blank"
    rel="noreferrer"
    use:tooltip={{ content: "osu! profile" }}
    style="display: block;">
    <img class="osu-avatar-small" height="36" width="36" alt="" src={getAvatarURL(id)} />
  </a>
</td>
