  <!-- Header de autenticación -->
  <div id="auth-header" class="bg-black text-white px-8 py-2 mb-8 flex justify-between items-center gap-2">
      <div class="w-full">
          <h1>Cafe Cauca</h1>
          <!-- Aquí se insertará la notificación si es necesaria -->
      </div>
      <div class="w-full flex justify-end items-center gap-x-2">

          <div id="notifications" class="popover">
              <button id="notifications-trigger" type="button" aria-expanded="false" aria-controls="notifications-popover" class="btn-outline bg-transparent text-white p-0 border-none mr-4">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                      <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                      <g id="SVGRepo_iconCarrier">
                          <path fill-rule="evenodd" clip-rule="evenodd" d="M12 1.25C7.71983 1.25 4.25004 4.71979 4.25004 9V9.7041C4.25004 10.401 4.04375 11.0824 3.65717 11.6622L2.50856 13.3851C1.17547 15.3848 2.19318 18.1028 4.51177 18.7351C5.26738 18.9412 6.02937 19.1155 6.79578 19.2581L6.79768 19.2632C7.56667 21.3151 9.62198 22.75 12 22.75C14.378 22.75 16.4333 21.3151 17.2023 19.2632L17.2042 19.2581C17.9706 19.1155 18.7327 18.9412 19.4883 18.7351C21.8069 18.1028 22.8246 15.3848 21.4915 13.3851L20.3429 11.6622C19.9563 11.0824 19.75 10.401 19.75 9.7041V9C19.75 4.71979 16.2802 1.25 12 1.25ZM15.3764 19.537C13.1335 19.805 10.8664 19.8049 8.62349 19.5369C9.33444 20.5585 10.571 21.25 12 21.25C13.4289 21.25 14.6655 20.5585 15.3764 19.537ZM5.75004 9C5.75004 5.54822 8.54826 2.75 12 2.75C15.4518 2.75 18.25 5.54822 18.25 9V9.7041C18.25 10.6972 18.544 11.668 19.0948 12.4943L20.2434 14.2172C21.0086 15.3649 20.4245 16.925 19.0936 17.288C14.4494 18.5546 9.5507 18.5546 4.90644 17.288C3.57561 16.925 2.99147 15.3649 3.75664 14.2172L4.90524 12.4943C5.45609 11.668 5.75004 10.6972 5.75004 9.7041V9Z" fill="currentColor"></path>
                      </g>
                  </svg>
              </button>
              <div id="notifications-popover" data-popover aria-hidden="true" class="w-auto min-w-[250px]">
                  <div class="grid gap-4">
                      <header class="grid gap-1.5">
                          <h4 class="leading-none font-medium">Notificaciones</h4>
                      </header>
                      <section class="max-h-[200px] overflow-scroll">
                          <ul id="notifications-list"></ul>
                      </section>
                      <button id="clear-all-notifications" class="btn-destructive">Clear all</button>
                  </div>
              </div>
          </div>


          <div>
              <span class="flex items-center"><img class="w-10 h-10 rounded-full"
                      src="https://basecoatui.com/assets/images/avatar-2.png" alt=""><span id="user-info"
                      class="ml-2 mr-4 flex flex-col">Cargando...</span></span>
              <!-- Aquí se insertará la notificación si es necesaria -->
          </div>
          <span>Salir</span>
          <button class="btn-sm-icon-destructive" onclick="logout()">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g fill="currentColor">
                      <path d="M12 3.25a.75.75 0 0 1 0 1.5 7.25 7.25 0 0 0 0 14.5.75.75 0 0 1 0 1.5 8.75 8.75 0 1 1 0-17.5" />
                      <path
                          d="M16.47 9.53a.75.75 0 0 1 1.06-1.06l3 3c.3.3.3.77 0 1.06l-3 3a.75.75 0 1 1-1.06-1.06l1.72-1.72H10a.75.75 0 0 1 0-1.5h8.19z" />
                  </g>
              </svg>
          </button>
      </div>
  </div>