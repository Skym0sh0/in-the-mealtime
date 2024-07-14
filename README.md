# In The Mealtime

InTheMealtime ist eine App, um kollaborativ Essen zu bestellen. Dazu werden im Grunde Restaurants angelegt mitsamt
Kontaktinformationen und hinterlegten Speisekarten. Dann können Bestellungen für diese Restaurants eröffnet werden, bei
denen sich alle Teilnehmer mitsamt dem gewünschten Essen eintragen können. Irgendwann muss wer die Verantwortung
übernehmen und das gewünschte Essen beim Restaurant bestellen und die Bestellung so schließen, um sie später abzuholen.

## Starten

### Dev
Es gibt eine docker-compose.yml, die eine Datenbank hochfährt. Diese Datenbank muss laufen zum Entwickeln. Dann gibt es
eine RunConfig, die das SpringProfile `dev` eingetragen hat und diese Datenbank benutzt. Damit kann das Backend benutzt
und weiter entwickelt werden.
Wahlweise kann auch die TestMode Application gestartet werden, die eine Datenbank on-the-fly mit startet, nach dem
runterfahren aber auch wieder killt. Sprich, die Daten bleiben nicht persistent.

Für das Frontend gibt es analog ein npm Command `dev`, das das Frontend im Entwickler Modus startet. Dabei wird genau
das eben gestartete Backend genutzt.

### Live
Hierzu reicht es die per Gradle Build gebaute Anwendung zu starten und vorher zu konfigurieren (Datenbank etc.).
