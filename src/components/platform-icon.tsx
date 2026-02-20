import { Facebook, Instagram, Linkedin, Youtube, Globe, Monitor, Video, HelpCircle } from "lucide-react"

interface PlatformIconProps {
    platform?: string | null
    className?: string
}

export function PlatformIcon({ platform, className = "h-4 w-4" }: PlatformIconProps) {
    if (!platform) return <Instagram className={`${className} text-pink-600`} />

    // Helper to extract width/height from className if possible, or default to 1em
    // Since we are replacing Lucide icons which use currentColor, we need to be careful.
    // However, the user wants "official colors", so we should ignore text-color classes usually.
    // The className usually sets width/height (h-4 w-4). We will keep that.

    switch (platform.toLowerCase()) {
        case 'instagram_post':
        case 'instagram':
            return (
                <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 0C8.741 0 8.333 0.014 7.053 0.072C2.695 0.272 0.273 2.69 0.073 7.052C0.014 8.333 0 8.741 0 12C0 15.259 0.014 15.668 0.072 16.948C0.272 21.306 2.69 23.728 7.052 23.928C8.333 23.986 8.741 24 12 24C15.259 24 15.668 23.986 16.948 23.928C21.302 23.728 23.73 21.31 23.927 16.948C23.986 15.668 24 15.259 24 12C24 8.741 23.986 8.333 23.928 7.053C23.732 2.699 21.311 0.273 16.949 0.073C15.668 0.014 15.259 0 12 0ZM12 2.162C15.204 2.162 15.584 2.174 16.85 2.232C20.102 2.381 21.621 3.902 21.77 7.153C21.827 8.419 21.838 8.799 21.838 12.003C21.838 15.206 21.826 15.585 21.769 16.85C21.62 20.104 20.101 21.624 16.85 21.772C15.584 21.829 15.204 21.842 12 21.842C8.796 21.842 8.416 21.83 7.15 21.772C3.897 21.623 2.38 20.101 2.231 16.85C2.174 15.584 2.163 15.205 2.163 12C2.163 8.796 2.175 8.417 2.232 7.151C2.381 3.901 3.896 2.38 7.149 2.232C8.417 2.175 8.796 2.163 12 2.163V2.162ZM5.838 12C5.838 15.403 8.597 18.163 12 18.163C15.403 18.163 18.162 15.404 18.162 12C18.162 8.597 15.403 5.838 12 5.838C8.597 5.838 5.838 8.597 5.838 12ZM12 16C9.791 16 8 14.21 8 12C8 9.791 9.791 8 12 8C14.209 8 16 9.791 16 12C16 14.21 14.209 16 12 16ZM16.965 5.595C16.965 6.39 17.61 7.035 18.406 7.035C19.201 7.035 19.845 6.39 19.845 5.595C19.845 4.8 19.201 4.155 18.406 4.155C17.61 4.155 16.965 4.8 16.965 5.595Z" fill="url(#instagram-gradient)" />
                    <defs>
                        <radialGradient id="instagram-gradient" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(12 23) rotate(-90) scale(23 23)">
                            <stop stopColor="#F9ED32" />
                            <stop offset="0.32" stopColor="#EE2A7B" />
                            <stop offset="1" stopColor="#D22828" />
                        </radialGradient>
                    </defs>
                </svg>
            )
        case 'facebook':
            return (
                <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M24 12.073C24 5.405 18.627 0 12 0C5.373 0 0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24V15.563H7.078V12.073H10.125V9.429C10.125 6.419 11.916 4.767 14.657 4.767C15.97 4.767 17.344 5.001 17.344 5.001V7.957H15.83C14.34 7.957 13.875 8.882 13.875 9.831V12.073H17.203L16.671 15.563H13.875V24C19.612 23.094 24 18.1 24 12.073Z" fill="#1877F2" />
                </svg>
            )
        case 'linkedin':
            return (
                <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.447 20.452H16.892V14.881C16.892 13.553 16.867 11.846 15.044 11.846C13.195 11.846 12.912 13.289 12.912 14.787V20.452H9.358V9H12.771V10.566H12.82C13.295 9.664 14.458 8.712 16.191 8.712C19.799 8.712 20.447 11.086 20.447 14.168V20.452ZM5.337 7.433C4.197 7.433 3.274 6.509 3.274 5.37C3.274 4.23 4.197 3.307 5.337 3.307C6.477 3.307 7.4 4.23 7.4 5.37C7.4 6.509 6.477 7.433 5.337 7.433ZM3.562 20.452H7.112V9H3.562V20.452ZM22.225 0H1.771C0.792 0 0 0.774 0 1.729V22.271C0 23.227 0.792 24 1.771 24H22.222C23.2 24 24 23.227 24 22.271V1.729C24 0.774 23.2 0 22.222 0H22.225Z" fill="#0A66C2" />
                </svg>
            )
        case 'youtube':
            return (
                <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M23.498 6.186C23.225 5.148 22.411 4.333 21.373 4.062C19.508 3.563 12 3.563 12 3.563C12 3.563 4.492 3.563 2.627 4.062C1.589 4.333 0.775 5.148 0.502 6.186C0 8.056 0 12 0 12C0 12 0 15.944 0.502 17.814C0.775 18.852 1.589 19.667 2.627 19.938C4.492 20.437 12 20.437 12 20.437C12 20.437 19.508 20.437 21.373 19.938C22.411 19.667 23.225 18.852 23.498 17.814C24 15.944 24 12 24 12C24 12 24 8.056 23.498 6.186ZM9.545 15.568V8.432L15.818 12L9.545 15.568Z" fill="#FF0000" />
                </svg>
            )
        case 'tiktok':
            return (
                <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19.59 6.69C17.03 6.69 14.83 5.48 13.43 3.65V16.35C13.43 20.03 10.43 23 6.75 23C3.07 23 0.0800002 20.01 0.0800002 16.33C0.0800002 12.65 3.07 9.66 6.75 9.66C7.38 9.66 7.97 9.77 8.54 9.94V13.88C8.04 13.68 7.42 13.56 6.75 13.56C5.22 13.56 3.98 14.81 3.98 16.34C3.98 17.87 5.22 19.11 6.75 19.11C8.28 19.11 9.53 17.87 9.53 16.34V0H13.43C13.43 2.5 15.45 4.52 17.95 4.52H19.59V6.69Z" fill="#000000" />
                </svg>
            )
        case 'website':
            return <Globe className={`${className} text-slate-500`} />
        case 'video':
            return <Video className={`${className} text-slate-500`} />
        default:
            return <HelpCircle className={`${className} text-slate-300`} />
    }
}
