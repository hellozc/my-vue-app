<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app'
import { provide } from 'vue'
import { AUTH_KEY, createAuth } from '@/composables/useAuth'

const auth = createAuth()
provide(AUTH_KEY, auth)

onLaunch(() => {
  void auth.init()
})
</script>

<style lang="scss">
@use '@/styles/reset.scss';
</style>
