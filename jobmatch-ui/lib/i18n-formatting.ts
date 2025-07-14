/**
 * Utility functions for locale-aware formatting
 */

export function formatDate(date: string | Date, locale: string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
        return 'Invalid Date';
    }

    return new Intl.DateTimeFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(dateObj);
}

export function formatShortDate(date: string | Date, locale: string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
        return 'Invalid Date';
    }

    return new Intl.DateTimeFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(dateObj);
}

export function formatRelativeTime(date: string | Date, locale: string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
        return 'Invalid Date';
    }

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 7) {
        return formatShortDate(dateObj, locale);
    }

    const rtf = new Intl.RelativeTimeFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
        numeric: 'auto'
    });

    if (diffInDays > 0) {
        return rtf.format(-diffInDays, 'day');
    } else if (diffInHours > 0) {
        return rtf.format(-diffInHours, 'hour');
    } else if (diffInMinutes > 0) {
        return rtf.format(-diffInMinutes, 'minute');
    } else {
        return rtf.format(-diffInSeconds, 'second');
    }
}

export function formatCurrency(amount: number, currency: string = 'USD', locale: string): string {
    const currencyMap: { [key: string]: string } = {
        'USD': 'USD',
        'VND': 'VND',
        'EUR': 'EUR',
        'GBP': 'GBP',
    };

    return new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
        style: 'currency',
        currency: currencyMap[currency] || 'USD',
        minimumFractionDigits: currency === 'VND' ? 0 : 2,
        maximumFractionDigits: currency === 'VND' ? 0 : 2,
    }).format(amount);
}

export function formatNumber(number: number, locale: string): string {
    return new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US').format(number);
}

export function formatSalaryRange(locale: string, currency: string = 'USD', minSalary?: number, maxSalary?: number): string {
    if (!minSalary && !maxSalary) {
        return locale === 'vi' ? 'Thỏa thuận' : 'Negotiable';
    }

    if (minSalary && maxSalary) {
        return `${formatCurrency(minSalary, currency, locale)} - ${formatCurrency(maxSalary, currency, locale)}`;
    }

    if (minSalary) {
        return `${locale === 'vi' ? 'Từ' : 'From'} ${formatCurrency(minSalary, currency, locale)}`;
    }

    if (maxSalary) {
        return `${locale === 'vi' ? 'Lên đến' : 'Up to'} ${formatCurrency(maxSalary, currency, locale)}`;
    }

    return locale === 'vi' ? 'Thỏa thuận' : 'Negotiable';
} 