<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Message from 'primevue/message'
import { useSesionStore } from '@/stores/sesion.js'
import { validarLogin } from '@/services/validacion.js'

const sesion = useSesionStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const errores = ref({})
const errorServidor = ref('')
const enviando = ref(false)

async function enviar() {
  errorServidor.value = ''
  errores.value = validarLogin({ email: email.value, password: password.value })
  if (Object.keys(errores.value).length > 0) return

  enviando.value = true
  try {
    await sesion.login(email.value.trim(), password.value)
    router.push({ name: 'inicio' })
  } catch (error) {
    // El email escrito se mantiene; solo se muestra el mensaje del servicio
    errorServidor.value = error.message
  } finally {
    enviando.value = false
  }
}
</script>

<template>
  <section class="login">
    <h1>Iniciar sesión</h1>

    <form novalidate @submit.prevent="enviar">
      <div class="campo">
        <label for="email">Email</label>
        <InputText
          id="email"
          v-model="email"
          type="email"
          autocomplete="email"
          :invalid="!!errores.email"
          fluid
          data-test="email"
        />
        <Message v-if="errores.email" severity="error" size="small" variant="simple" data-test="error-email">
          {{ errores.email }}
        </Message>
      </div>

      <div class="campo">
        <label for="password">Contraseña</label>
        <Password
          v-model="password"
          input-id="password"
          :feedback="false"
          toggle-mask
          autocomplete="current-password"
          :invalid="!!errores.password"
          fluid
          data-test="password"
        />
        <Message v-if="errores.password" severity="error" size="small" variant="simple" data-test="error-password">
          {{ errores.password }}
        </Message>
      </div>

      <Message v-if="errorServidor" severity="error" data-test="error-servidor">{{ errorServidor }}</Message>

      <Button type="submit" label="Iniciar sesión" :loading="enviando" :disabled="enviando" fluid data-test="enviar" />
    </form>
  </section>
</template>

<style scoped>
.login {
  max-width: 380px;
  margin: 2rem auto;
  padding: 1.5rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.1);
}

form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.campo {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
</style>
