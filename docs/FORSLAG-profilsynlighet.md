# Profilsynlighet (steg 5) — beslutad: alternativ A

**Beslut (Mark):** alternativ A, utloggade ser inga tips, tips visas bara från
användare med "Alla" eller vänner. Migreringen är skriven i
`supabase/migrations/20261112000000_tips_visibility.sql` och körs automatiskt
när PR:en mergas till `main` (workflowet "supabase-deploy"). Nya användare
startar fortsatt som "Bara vänner" (oförändrat standardvärde).

## Vad som finns i dag

- Kolumnen `profiles.privacy_setting` finns redan och har exakt två värden:
  `public` och `friends_only` (nya användare får `friends_only`).
- Inställningen i appen (nya Settings-sidan) skriver redan till den kolumnen:
  **Alla** = `public`, **Bara vänner** = `friends_only`. Det är samma mappning som
  specen vill ha (`true → everyone`, `false → friends`), bara med andra namn.
- **Därför behövs ingen migrering för att byta namn eller värden.** Att döpa om
  värdena till `everyone`/`friends` skulle bara ge risk utan nytta.

## Det viktiga problemet: valet gör ingenting i databasen

Regeln för tips (`"Anyone can view tips except from blocked users"`) låter
**alla, även utloggade gäster**, läsa **alla** tips. Valet "Bara vänner" döljer
alltså ingenting i dag. Hjälptexten i Settings ("Only your friends can see your
profile and tips") är därför inte sann ännu.

Dessutom: `profiles_public`-vyn (det appen läser andra användare via) tittar
inte på `privacy_setting`.

## Alternativ

**A. Gör valet på riktigt (rekommenderas)**
Ny migrering som ändrar läsregeln för tips så att ett tips syns om:
ägaren själv tittar, **eller** ägarens `privacy_setting = 'public'`, **eller**
tittaren och ägaren har en godkänd vänskap (och blockerade användare fortsatt
döljs). Skiss (ej körd):

```sql
create or replace function public.can_view_user_content(_owner uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select
    _owner = auth.uid()
    or exists (select 1 from public.profiles p
               where p.id = _owner and p.privacy_setting = 'public')
    or exists (select 1 from public.friendships f
               where f.status = 'accepted'
                 and ((f.requester_id = _owner and f.addressee_id = auth.uid())
                   or (f.addressee_id = _owner and f.requester_id = auth.uid())));
$$;

drop policy "Anyone can view tips except from blocked users" on public.tips;
create policy "View tips by privacy setting and blocks"
on public.tips for select
using (
  public.can_view_user_content(user_id)
  and (auth.uid() is null
       or not exists (select 1 from public.blocked_users
                      where blocker_id = auth.uid() and blocked_id = tips.user_id))
);
-- + motsvarande filter i profiles_public (bara public-användare, eller vänner)
-- + explicit GRANT EXECUTE på funktionen
```

Konsekvenser att veta om:
- **Gäster** (utan inloggning) ser bara tips från användare med `public`.
- Nya användare börjar som `friends_only` → deras tips syns inte på kartan för
  andra förrän de är vänner eller byter till **Alla**. Vill vi ändra
  standardvärdet till `public`? (Det är ett val om integritet – Marks beslut.)
- Du är i dag enda användaren, så inget syns annorlunda för dig.

**B. Gör inget i databasen nu**
Behåll dagens beteende och ändra hjälptexten så att den inte lovar något
som inte stämmer. Kan göras senare.

## Det jag behöver från Mark

1. A eller B?
2. Om A: ska nya användare börja som **Alla** eller **Bara vänner**?
3. Om A: ska gäster få se tips från användare med "Alla" (som i dag), ja/nej?
