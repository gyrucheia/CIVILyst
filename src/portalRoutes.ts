export const pagesPreview = import.meta.env.BASE_URL === "/CIVILyst/"
export const publicHome = import.meta.env.BASE_URL
export const staffHome = pagesPreview ? publicHome + "?view=staff" : "/portal"
export const staffHelp = pagesPreview ? publicHome + "?view=staff-help" : "/portal/help"
