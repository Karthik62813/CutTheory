# Video editor portfolio

A portfolio site with its own admin panel. Built with Next.js 16, Supabase (database and admin login) and Cloudflare R2 (video and image storage).

- **Site** (`/`): hero with a scrubbable timeline, filterable work grid with hover previews, clients, services, about, contact.
- **Project pages** (`/work/<slug>`): the full video, details, tags and a link to the next project.
- **Admin** (`/admin`): projects, categories, clients and settings. Changes show on the site as soon as you save.

## Run it locally

```bash
npm install
cp .env.example .env.local   # then fill it in (see below)
npm run dev                  # http://localhost:3000
```

Without Supabase settings the site runs on sample data (`lib/sample-data.ts`), so you can preview the design first. The admin needs Supabase.

## 1. Supabase (required)

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor**, paste all of `supabase/setup.sql` and click **Run**. Do this once. It creates the tables, the security rules and the default categories. (`supabase/migrations/` holds the same SQL for the Supabase CLI. Use one or the other, not both.)
3. Under **Authentication > Users**, click **Add user** and create your admin login (email and password).
4. Put that email into `supabase/create-admin.sql` and run it in the SQL Editor. Only accounts listed this way can use the admin.
5. Recommended: under **Authentication > Sign In / Providers**, turn off **Allow new users to sign up**.
6. Copy the project URL and the publishable key (**Connect**, or **Settings > API Keys**) into `.env.local`.

## 2. Cloudflare R2 (optional, for uploads)

Without R2 the admin still works: you paste https links (including YouTube and Vimeo) instead of uploading files.

1. In Cloudflare, open **R2** and create a bucket.
2. In the bucket's **Settings**, under **Public access**, enable the r2.dev subdomain or connect a custom domain. Copy that address into `R2_PUBLIC_URL`. Cloudflare rate-limits r2.dev, so use a custom domain for a live site.
3. In the bucket's **Settings**, set the **CORS policy** so the browser can upload straight to the bucket:

   ```json
   [
     {
       "AllowedOrigins": ["http://localhost:3000", "https://your-site.com"],
       "AllowedMethods": ["PUT"],
       "AllowedHeaders": ["content-type"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```

4. Go to **R2 > Manage API tokens > Create API token**, choose **Object Read & Write** and limit it to this bucket. Copy the Access Key ID and Secret Access Key into `.env.local`, along with your account ID and the bucket name.
5. Restart `npm run dev`. The project form now shows **Upload** buttons.

Files go from the browser straight to R2, so large videos never pass through the server. The **storage limit** in Settings (10 GB by default, the size of R2's free tier) blocks any upload that would go over it. Replacing or removing a file deletes the old one from R2. Deleting a project or client deletes its files.

Upload limits: video up to 2 GB, preview clip up to 60 MB (MP4 or WebM), thumbnail up to 8 MB, logo up to 2 MB (JPG, PNG, WebP or AVIF). Export videos as MP4 (H.264): it plays in every browser, and .mov and ProRes files don't.

## 3. Deploy

On Vercel (or any Next.js host): import the repository, add the same environment variables, and deploy. Then add the live address to the R2 CORS `AllowedOrigins`.

## Using the admin

- **Projects**: title, category, details and three files. The **video** is the full edit shown on the project page. The **preview clip** is a short loop that plays when someone hovers the card. The **thumbnail** is a 9:16 image shown before the preview. A project needs a video before it can be published. **Featured** adds a badge to the card. Use the arrows to set the order.
- **Categories**: these become the filter buttons. The colour tints the cards. Only categories with published work get a button.
- **Clients**: names, logos and links for the "Clients I've worked with" section. Turn the section on in Settings.
- **Settings**: your name, contact links, the About text, and the messages that prefill when a visitor clicks Email or WhatsApp. Instagram and LinkedIn can't prefill a message, so it's copied for the visitor to paste.

## Code layout

```
app/(site)/          public site: home, /work/[slug], 404
app/(admin)/admin/   admin: login, then (panel)/ for the signed-in pages
  (panel)/manage.ts  every save and delete (server actions)
  (panel)/upload.ts  signs uploads to R2
components/          site sections
lib/data.ts          what the public pages read from Supabase
lib/r2.ts            R2 client (AWS Signature V4, no SDK)
supabase/            database setup SQL
```
