import { app } from './app'

app
  .listen({
    port: 5000,
  })
  .then(() => {
    console.log('HTTP Server Running!')
  })
