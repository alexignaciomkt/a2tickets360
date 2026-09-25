export function getPublicEventUrl(event: { slug?: string | null, id: string }): string {
    if (event.slug) return `${window.location.origin}/evento/${event.slug}`;
    return `${window.location.origin}/events/${event.id}`;
}

export function getPublicStaffUrl(profile: { slug?: string | null, userId: string }): string {
    if (profile.slug) return `${window.location.origin}/staff/${profile.slug}`;
    return `${window.location.origin}/profissionais/${profile.userId}`;
}

export function getPublicPromoterUrl(promoter: { slug?: string | null, userId?: string, id?: string }): string {
    if (promoter.slug) return `${window.location.origin}/promoter/${promoter.slug}`;
    return `${window.location.origin}/promoter/${promoter.id || promoter.userId}`;
}

export function getPublicProducerUrl(producer: { slug?: string | null, id: string }): string {
    if (producer.slug) return `${window.location.origin}/produtora/${producer.slug}`;
    return `${window.location.origin}/p/${producer.id}`;
}
