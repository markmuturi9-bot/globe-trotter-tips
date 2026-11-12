# Supabase – saker Mark måste göra själv

Koden för kontoskapande med e-postkod är klar, men **den fungerar inte
fullt ut förrän du gjort stegen nedan i Supabase-dashboarden**
(https://supabase.com/dashboard → projektet TIPIT). Appen kan inte göra
detta åt dig.

Tills det är gjort: räkna inte med att registrering/glömt lösenord
fungerar. Mejlen skickas, men utan steg 3 innehåller de en länk i stället
för koden som appen frågar efter.

## Före merge: kontrollera befintliga användarnamn (1 minut)

Migreringen `20261113000000_username_rules.sql` kräver unika användarnamn
(stora/små bokstäver räknas som samma). Gå till **SQL Editor** och kör:

```sql
select lower(username) as namn, count(*) from public.profiles group by 1 having count(*) > 1;
select username from public.profiles where username !~ '^[A-Za-z0-9_-]{3,30}$';
```

- Första frågan ska ge **0 rader**. Annars stoppas migreringen med ett
  tydligt fel (inget går sönder) – byt namn på dubbletterna först.
- Andra frågan visar användarnamn med ogiltiga tecken. De får vara kvar,
  men kan inte ändras till något ogiltigt. Säg till om du vill rätta dem.

## 1. Kräv bekräftad e-post

**Authentication → Sign In / Providers → Email** (kan heta *Providers →
Email*): slå på **Confirm email**.

## 2. Minsta lösenordslängd

**Authentication → Sign In / Providers → Password** (eller
*Authentication → Password*): sätt **Minimum password length** till **8**.
Inga andra krav (ingen tvingande stor bokstav/siffra).

Kontrollera också att **Email OTP Length** är **6** (standard – ändra inte).

## 3. Ändra mejlmallarna så de visar koden

**Authentication → Email Templates**. Ändra två mallar. Ersätt
`{{ .ConfirmationURL }}` (länken) med `{{ .Token }}` (koden). Lämna kvar
koden `{{ .Token }}` exakt som den står.

Mejlet skickas utan att känna till användarens språk, så mallarna har
båda språken i samma mejl.

### Mall "Confirm signup"

**Subject:** `Din kod till TIPIT / Your TIPIT code`

**Message body:**

```html
<h2>Bekräfta din e-post</h2>
<p>Skriv den här koden i TIPIT-appen:</p>
<p style="font-size:28px;font-weight:bold;letter-spacing:6px">{{ .Token }}</p>
<p>Koden gäller en kort stund. Om du inte skapade ett konto kan du ignorera mejlet.</p>

<hr>

<h2>Confirm your email</h2>
<p>Enter this code in the TIPIT app:</p>
<p style="font-size:28px;font-weight:bold;letter-spacing:6px">{{ .Token }}</p>
<p>The code is valid for a short time. If you did not create an account, you can ignore this email.</p>
```

### Mall "Reset password"

**Subject:** `Kod för nytt lösenord / Password reset code`

**Message body:**

```html
<h2>Nytt lösenord</h2>
<p>Skriv den här koden i TIPIT-appen för att välja ett nytt lösenord:</p>
<p style="font-size:28px;font-weight:bold;letter-spacing:6px">{{ .Token }}</p>
<p>Om du inte bad om detta kan du ignorera mejlet – ditt lösenord ändras inte.</p>

<hr>

<h2>Reset your password</h2>
<p>Enter this code in the TIPIT app to choose a new password:</p>
<p style="font-size:28px;font-weight:bold;letter-spacing:6px">{{ .Token }}</p>
<p>If you did not ask for this, you can ignore this email – your password will not change.</p>
```

## Bra att veta

- Supabase skickar mejlen. Den inbyggda avsändaren har en låg gräns
  (några få mejl i timmen). Det räcker för test; för riktig användning
  kan du senare byta SMTP-leverantör under **Project Settings →
  Authentication → SMTP Settings** – ingen kodändring behövs.
- Varje gång du ber om en ny kod blir den gamla ogiltig. Appen väntar
  60 sekunder mellan försök.
- Ett konto som aldrig bekräftas håller kvar sitt användarnamn. (Kan
  rensas manuellt under Authentication → Users om det behövs.)
