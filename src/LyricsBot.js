/**
 * The above JavaScript code defines a Telegram bot called LyricsRythmBot that can provide lyrics of
 * songs and search for artists based on genres using the Spotify and Genius APIs.
 * @returns The code provided sets up a Telegram bot called LyricsRythmBot that can assist users with
 * lyrics of songs and genre recommendations. Here's a summary of what is being returned by the code:
 */
require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
const apiKey = process.env.apiKeySong;
const ClientID = process.env.ClientID;
const ClientSecret = process.env.ClientSecret;

// Función para obtener el token de acceso y utilizar la API de Spotify
async function getAccessToken() {
  const response = await axios.post('https://accounts.spotify.com/api/token', null, {
    params: {
      grant_type: 'client_credentials',
    },
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    auth: {
      username: ClientID,
      password: ClientSecret,
    },
  });

  return response.data.access_token;
}

// Buscar artistas según el género
async function searchArtistsByGenre(genre) {
  const accessToken = await getAccessToken();

  const response = await axios.get('https://api.spotify.com/v1/search', {
    params: {
      q: `genre:${genre}`,
      type: 'artist',
    },
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data.artists.items;
}

// Función para obtener la letra de una canción
async function getLyrics(SongArtist) {
  try {
    const response = await axios.get(
      `https://api.genius.com/search?q=${encodeURIComponent(`${SongArtist}`)}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    // Extraer la URL de la letra desde la respuesta
    const url = response.data.response.hits[0].result.url;
    return url;
  } catch (error) {
    console.error("Error al obtener la letra:", error);
    return null;
  }
}

try {
  let waitingForLyrics = false;
  let waitingForArtistas = false;

  // Imágenes para enviar al usuario
  var imagenes = [
    "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDg3Nzc1OTBwZXI2N2d1b2M2eGgyNTFvcGkxdW85OWs2bHZoN2N6ZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/tqfS3mgQU28ko/giphy.gif",
    "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMDA0dDNia3JlenN1Nm9kbWM0bDc2YzN3d3MwYzhvM3d6MmZ2M2h6cCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/4oMoIbIQrvCjm/giphy.gif",
    "https://media.giphy.com/media/cgW5iwX0e37qg/giphy.gif?cid=790b7611004t3bkrezsu6odmc4l76c3wws0c8o3wz2fv3hzp&ep=v1_gifs_search&rid=giphy.gif",
    "https://media.giphy.com/media/7UzKL9kj5vnlm/giphy.gif?cid=ecf05e47k3iy2utz8ml2256yv0y0w1dgv0nhcrm36m3sjns9&ep=v1_gifs_search&rid=giphy.gif",
    "https://cdn.discordapp.com/attachments/1199793469305147396/1206980529769938965/IMG_3102.jpg?ex=65ddfb36&is=65cb8636&hm=f91447cb5054edb1552ab8653d183a1773d1e6d5e22b2526ba3106a17b24f30d&",
    "https://media.giphy.com/media/blSTtZehjAZ8I/giphy.gif?cid=790b76112p9ruw6ulws5l3k6itmp3rid6ehjmyg6d9rz75cr&ep=v1_gifs_search&rid=giphy.gif&ct=g",
    "https://media.giphy.com/media/dM2xuxnJCg4H6/giphy.gif?cid=790b76112p9ruw6ulws5l3k6itmp3rid6ehjmyg6d9rz75cr&ep=v1_gifs_search&rid=giphy.gif&ct=g",
    
  ];

  // Token del bot para la comunicación
  const token = "6773824406:AAGxVOHc8Kkuo6d3h5Kj-kfI645Zcnb39sg";
  const bot = new TelegramBot(token, { polling: true });

  // Iniciar chat con el bot callback
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    waitingForArtistas = false;
    waitingForLyrics = false;

    // Mensaje de bienvenida
    bot.sendMessage(
      chatId,
      "¡Hola! Soy LyricsRythmBot🎧 , \n\n tu asistente musical🎵 . Estoy aquí para ayudarte con letras de canciones y recomendaciones de géneros musicales. \n\n Utiliza /Menu para ver las opciones disponibles 🎙🎤."
    ).then(() => {
      // Envío de una imagen aleatoria
      bot.sendPhoto(chatId, imagenes[Math.floor(Math.random() * imagenes.length)]);
    });
  });

  // Comando para mostrar el menú
  bot.onText(/\/Menu/, (msg) => {
    const chatId = msg.chat.id;
    waitingForArtistas = false;
    waitingForLyrics = false;

    // Mensaje del menú
    const menuMessage = "¡Bienvenido al menú!\n";

    // Teclado con opciones
    const menuKeyboard = {
      keyboard: [
        [{ text: "/Artistas" }],
        [{ text: "/LetraDeCanciones" }]
      ],
      one_time_keyboard: true
    };

    // Opciones adicionales
    const options = {
      reply_markup: menuKeyboard,
    };

    // Envío del mensaje del menú
    bot.sendMessage(chatId, menuMessage, options).then(() => {
      // Envío de una imagen aleatoria
      bot.sendPhoto(chatId, imagenes[Math.floor(Math.random() * imagenes.length)]);
    });
  });

  // Manejar errores de polling
  bot.on('polling_error', (error) => {
    console.error('Error de polling:', error);
  });

  // Comando para buscar artistas
  bot.onText(/\/Artistas/, (msg) => {
    const chatId = msg.chat.id;
    waitingForArtistas = true;

    // Mensaje para seleccionar un género musical
    const generosMessage = "Selecciona un género musical o escríbelo";

    // Teclado con opciones de género
    const menu = {
      keyboard: [
        [{ text: "Pop" }],
        [{ text: "Rock" }],
        [{ text: "Hip Hop" }],
        [{ text: "Bolero" }],
        [{ text: "Indie" }],
        [{ text: "Techno" }]
      ],
    };

    // Opciones adicionales
    const options = {
      reply_markup: menu,
    };

    // Envío del mensaje de selección de género
    bot.sendMessage(chatId, generosMessage, options);
  });

  // Comando para solicitar la letra de una canción
  bot.onText(/\/LetraDeCanciones/, (msg) => {
    const chatId = msg.chat.id;
    waitingForLyrics = true;

    // Mensaje para solicitar la letra
    bot.sendMessage(
      chatId,
      'Por favor, proporciona el nombre de la canción para obtener la letra de esta manera \n\n  "NombreCancion NombreAutor"'
    );
  });

  // Manejar mensajes
  bot.on("message", (msg) => {
    const chatId = msg.chat.id;
    const message = msg.text;

    if (waitingForLyrics && !message.startsWith("/")) {
      // Lógica para manejar el nombre de la canción aquí
      bot.sendMessage(chatId, `Obteniendo la letra para "${message}" 🔎`);

      // Obtener la letra y enviarla
      getLyrics(message)
        .then((res) => {
          bot.sendMessage(chatId, `${res}`).then(() => {
            bot.sendMessage(chatId, "Volver a /Menu");
          });
        })
        .catch((error) => {
          console.log(error);
          bot.sendMessage(chatId, ` Hubo un error al encontrar la letra de ${message}`);
        });

      waitingForLyrics = false;
    } else if (waitingForArtistas && !message.startsWith("/")) {
      // Lógica para buscar artistas aquí
      bot.sendMessage(chatId, `Buscando Artistas de "${message}" 🔎`).then(() => {
        // Buscar artistas y mostrarlos
        searchArtistsByGenre(message)
          .then((res) => {
            var menuMessage = `Artistas De ${message} \n\n\n `;

            res.map((artista, index) => (
              menuMessage += `- ${artista.name}\n`
            ));

            if (res.length > 0) {
              // Enviar la lista de artistas
              bot.sendMessage(chatId, menuMessage,).then(() => {
                // Envío de una imagen aleatoria
                bot.sendPhoto(chatId, imagenes[Math.floor(Math.random() * imagenes.length)]);
              }).then(() => {
                // Mensaje para volver al menú
                bot.sendMessage(chatId, "Volver a /Menu");
              });

            } else {
              // Mensaje si no se encontraron artistas
              bot.sendMessage(chatId, "No se encontraron artistas del género ❌❌❌",);
            }
          })
          .catch((err) => console.log(err));
      });
    }
  });

} catch (error) {
  console.error("Error:", error);
}
