# Bottom Navigation Redesign — Wellness Premium

## Context

The ALOEC mobile app is a health/wellness platform where patients follow daily therapeutic protocols containing meal blocks (breakfast, mid-morning, lunch, mid-afternoon, dinner), supplements, activities, and notes. The current bottom navigation (Horario, Jugos, IMC, Cursos, Perfil) doesn't reflect the actual product flow — the daily protocol, which is the core user action, has no dedicated presence. Additionally, the logout flow has state management bugs that leave stale data. This redesign aligns navigation to the real user journey and fixes auth state issues.

## Information Architecture

### Bottom Navigation (4 tabs)

| # | Tab | Icon (inactive) | Icon (active) | Purpose |
|---|-----|----------------|---------------|---------|
| 0 | Hoy | `calendar_today_outlined` | `calendar_today` | Daily protocol — main screen, therapeutic agenda |
| 1 | Recetas | `restaurant_menu_outlined` | `restaurant_menu` | Recipe/juice catalog from active protocol |
| 2 | Progreso | `insights_outlined` | `insights` | BMI, compliance stats, history |
| 3 | Perfil | `person_outline` | `person` | User data, subscription, settings, logout |

### Relocated Elements

| Element | From | To |
|---------|------|----|
| IMC calculator | Bottom nav tab | Inside Progreso tab |
| Cursos | Bottom nav tab | AppBar icon (`school`) on "Hoy" screen |
| Horario (schedule) | Bottom nav tab | Merged into "Hoy" protocol timeline |
| Jugos (juices) | Bottom nav tab | Merged into "Recetas" catalog |

### FAB (Floating Action Button)

- **Position**: `FloatingActionButtonLocation.endFloat` (bottom-right, above nav)
- **Tap**: Marks next pending protocol block as completed (haptic + animated check)
- **Long press**: Opens `DraggableScrollableSheet` listing all day blocks to pick which to complete
- **Visual**: `primaryGreen` solid background, white `check_rounded` icon 28px, green diffuse shadow `primaryGreen.withOpacity(0.35), blurRadius: 16, offset: Offset(0, 6)`

## Visual Design — Wellness Premium

### Bottom Nav Container

- Custom `Container` (not native `NavigationBar`)
- `margin: EdgeInsets.fromLTRB(16, 0, 16, 12)`
- `borderRadius: BorderRadius.circular(24)`
- `color: Colors.white`
- `boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.08), blurRadius: 20, offset: Offset(0, 4))]`
- Height: 68px
- Internal padding: `horizontal: 8`

### Tab Item States

- **Inactive**: outlined icon, `AppColors.textLight`, label 11px weight 500
- **Active**: filled icon, `AppColors.primaryGreen`, label 12px weight 700, 5px green dot below label
- **Transition**: `AnimatedSwitcher` 200ms `FadeTransition`

### Color Palette (existing `AppColors`)

- `primaryGreen`: #67B539
- `backgroundLight`: #F8F9FA
- `textDark`: #1E293B
- `textLight`: #64748B
- `error`: #E11D48

## Screen: "Hoy" — Therapeutic Agenda

### AppBar

- Left: "ALOEC" in `primaryGreen`, weight 800
- Center: current date with dropdown to pick other days
- Right: `school` icon (courses) + `notifications_outlined`

### Body — Protocol Timeline

Vertical timeline with connecting line, each block is a card:

- Header: "Protocolo Dia X / Total" with horizontal progress bar showing completion %
- Blocks ordered by time: 08:00 Desayuno, 10:00 Media Manana, 13:00 Almuerzo, 15:00 Media Tarde, 18:00 Cena
- Below main blocks: "Actividades del dia" section (walks, enemas, etc.)
- Below activities: "Notas importantes" section with pinned notes

### Block Card Design

Each block is a card with:
- Left border 3px colored by state
- Time badge on the left
- Title + subtitle (meal name, supplement details)
- Right side: state icon
- Tap to expand: full recipe, ingredients, instructions

### Block States

| State | Circle | Line | Background | Border left | Icon |
|-------|--------|------|-----------|-------------|------|
| Completed | Filled green | Solid green | `primaryGreen.withOpacity(0.05)` | 3px green | `check_circle` green |
| Active/Now | Green with pulse glow | Solid green top, dashed bottom | White, `elevation: 2` | 3px green | `radio_button_checked` with glow |
| Pending | Empty grey | Dashed grey | White, no elevation | 1px `grey.shade100` | `radio_button_unchecked` |
| Overdue | Empty red tint | Dashed grey | `error.withOpacity(0.04)` | 3px red | `warning_amber` |

### Microinteractions

- **Complete block**: checkmark scale 0->1 with bounce curve, timeline line paints green top-down 200ms
- **Open screen**: auto-scroll to current active block
- **Tab enter**: staggered fade-in of cards (50ms delay between each)
- **Progress bar**: smooth fill animation on load

## Screen: "Recetas"

- Grid layout of recipe cards with image, name, category tags
- Category filter chips: Jugos, Comidas, Suplementos
- Reuses and extends existing `JuicesScreen` logic
- Each card navigates to recipe detail (ingredients, steps, instructions)

## Screen: "Progreso"

- **BMI Card**: current BMI value, classification, last calculated date, "Recalcular" button -> `BmiCalculatorScreen`
- **Weekly compliance chart**: completed blocks vs total per day (bar chart)
- **Current streak**: "X dias consecutivos" badge
- **Protocol history**: list of past completed protocols

## Screen: "Perfil"

- Same layout as current `ProfileScreen`
- Includes logout fix (see below)

## Logout Fix

### Problems Identified

1. Riverpod providers retain cached data after `signOut()` — screens show previous user's data
2. `context.go('/splash')` can fail if widget unmounts before navigation due to auth state change race
3. No provider invalidation on sign out

### Solution

1. **Router-driven redirect**: Add `refreshListenable` to `GoRouter` bound to auth state stream so redirect fires automatically on sign-out — remove manual `context.go('/splash')`
2. **Provider invalidation**: After `signOut()`, invalidate user-data providers (BMI records, juice schedule, protocol data) via `ref.invalidate()`
3. **Auth provider**: `signOut()` already emits `unauthenticated` via stream, which triggers GoRouter redirect

### Files to Modify

- `app_router.dart`: Add `refreshListenable` with `GoRouterRefreshStream(authStateChanges)`
- `profile_screen.dart`: Replace `context.go('/splash')` with provider invalidation after `signOut()`
- `auth_provider.dart`: No changes needed (stream already works correctly)

## Tab Transitions

- Wrap `IndexedStack` children with `AnimatedSwitcher` using `FadeTransition` 200ms
- Keep `IndexedStack` to preserve tab state across switches

## Files to Create

| File | Purpose |
|------|---------|
| `lib/features/home/presentation/widgets/wellness_bottom_nav.dart` | Custom floating bottom nav widget |
| `lib/features/home/presentation/widgets/protocol_fab.dart` | FAB with tap/long-press behavior |
| `lib/features/home/presentation/screens/today_screen.dart` | "Hoy" protocol timeline screen |
| `lib/features/home/presentation/widgets/protocol_timeline.dart` | Timeline widget with block cards |
| `lib/features/home/presentation/widgets/block_card.dart` | Individual protocol block card |
| `lib/features/progress/presentation/screens/progress_screen.dart` | Progreso tab screen |

## Files to Modify

| File | Changes |
|------|---------|
| `lib/features/home/presentation/screens/home_screen.dart` | Replace NavigationBar with custom nav, update tab list, add FAB |
| `lib/features/profile/presentation/screens/profile_screen.dart` | Fix logout: remove `context.go`, add provider invalidation |
| `lib/core/router/app_router.dart` | Add `refreshListenable` for auth-driven redirect |
| `lib/core/constants/app_colors.dart` | No changes needed |

## Verification

1. Run `flutter analyze` — no errors
2. Run the app, verify 4 tabs render with floating nav style
3. Tap each tab — smooth fade transition, state preserved
4. On "Hoy" tab: protocol timeline displays with mock data, states render correctly
5. FAB tap: marks next pending block, animation plays
6. FAB long press: bottom sheet opens with block list
7. Logout: tap "Cerrar sesion" -> confirm -> providers invalidated -> redirects to splash automatically
8. Login as different user: no stale data from previous user
9. Courses icon in AppBar navigates to courses screen
10. Progreso tab shows BMI card with "Recalcular" button
