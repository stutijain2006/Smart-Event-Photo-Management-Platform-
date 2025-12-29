export function getCSRFToken() {
    const name = 'csrftoken'
    const cookieValue = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')?.pop() || ''
    for (let cookie of cookieValue){
        const [key, value] = cookie.trim().split('=')
        if (key === name){
            return value
        };
    }
    return null;
}