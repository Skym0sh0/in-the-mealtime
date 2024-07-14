import {SvgIcon} from "@mui/material";

export default function Logo(props:any) {
  return <SvgIcon {...props} >
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#f8b400"/>

      <circle cx="16" cy="16" r="10" fill="white" stroke="#333" strokeWidth="2"/>

      <g transform="translate(0, 6)">
        <rect x="10" y="6" width="2" height="12" fill="#aaa"/>
        <rect x="6" y="4" width="10" height="2" fill="#aaa"/>
        <rect x="6" y="2" width="2" height="2" fill="#aaa"/>
        <rect x="10" y="2" width="2" height="2" fill="#aaa"/>
        <rect x="14" y="2" width="2" height="2" fill="#aaa"/>
      </g>

      <g transform="translate(0, 6)">
        <rect x="20" y="2" width="2" height="16" fill="#aaa"/>
        <rect x="21" y="2" width="2" height="8" fill="#aaa"/>
      </g>

      <path d="M16 18 C14 18, 14 20, 16 20 C18 20, 18 18, 16 18" fill="#4caf50"/>
    </svg>
  </SvgIcon>
}
