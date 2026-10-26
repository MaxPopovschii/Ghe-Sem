# Stato integrazione dati reali

Il prototipo non dispone di un feed ATM realtime verificato. Posizioni, arrivi, percorsi del simulatore e avvisi sono dati dimostrativi e non vanno usati per pianificare viaggi reali.

Gli endpoint e le istruzioni precedenti erano esempi non verificati: non è sufficiente impostare una chiave o cambiare un flag per ottenere dati reali.

Per integrare un feed occorrono una fonte autorizzata con documentazione, verifica di licenza e autenticazione, un adattatore del formato e test sul timestamp dei dati. I dati GTFS statici descrivono il servizio programmato e non dimostrano posizioni realtime. Le credenziali riservate vanno gestite da un backend, mai in variabili VITE_.
