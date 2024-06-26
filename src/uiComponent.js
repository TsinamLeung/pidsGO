import './uiComponent.css';
import { Button } from '@mui/material';
import { Box, hexToRgb } from '@mui/system';
import { styled } from '@mui/material/styles';
import { purple, red, yellow } from '@mui/material/colors';


export const BlackButton = styled(Button)(({ theme }) => ({
    color:  theme.palette.getContrastText(hexToRgb('000000')),
    backgroundColor: hexToRgb('000000'),
    '&:hover': {
      backgroundColor: hexToRgb('040404'),
    },
  }));
  


export const PurpleButton = styled(Button)(({ theme }) => ({
    color: theme.palette.getContrastText(purple[500]),
    backgroundColor: purple[700],
    '&:hover': {
      backgroundColor: purple[500],
    },
  }));

const SideButtonFontSize = 33
const sideButtonTheme = {
  fontSize: SideButtonFontSize,
  flexGrow: 1

}
export const ArrivalButton = styled(Button)(({ theme }) => ({
    ...sideButtonTheme,
    color: theme.palette.getContrastText(purple[500]),
    backgroundColor: purple[700],
    '&:hover': {
      backgroundColor: purple[500],
    },

  }));

  export const DepartureButton = styled(Button)(({ theme }) => ({
    ...sideButtonTheme,
    color: theme.palette.getContrastText(red[500]),
    fontSize: SideButtonFontSize,
    backgroundColor: red[700],
    '&:hover': {
      backgroundColor: red[500],
    },
  }));

  export const StopButton = styled(Button)(({ theme }) => ({
    ...sideButtonTheme,
    color: theme.palette.getContrastText(purple['A400']),
    fontSize: SideButtonFontSize,
    backgroundColor: purple['A400'],
    '&:hover': {
      backgroundColor: purple['A200'],
    },
  }));

  export const LineButton = styled(Button)(({ theme }) => ({
    ...sideButtonTheme,
    color: theme.palette.getContrastText(yellow['A700']),
    fontSize: SideButtonFontSize,
    backgroundColor: yellow['A400'],
    '&:hover': {
      backgroundColor: yellow['A700'],
    },
  }));

export function ButtonBox(props) {
    return (
        <BlackButton 
         onClick={props.onClick} 
         className="ButtonBox"
         style={{fontSize: "calc(12px + 2vmin)"}}
         >
            {props.content}
        </BlackButton>
    )
}

export function SimpleDivider(props) {
   let style = {};
   if(props.vertical)
   {
     style = {
        height: '100%'
     };
   }else if(props.horizontal) {
       style = {
        width: '100%'
       };
   }
    return (
        <span className="SimpleDivider" style={style}></span>
    )
}

export function IconInfoBox(props) {
    return(
        <Box sx={{
            ...props.sx,
            display: 'inline'
        }}>
            {props.icon}
            <span>{props.title}</span>
            <span style={{color: props.contentColor}}>{props.content}</span>
        </Box>
    )
}

export function InfoFramework(props) {
    return(
        <Box className="InfoFramework" 
            sx={{
                ...props.sx,
                width: props.width,
                height: props.height,
                backgroundColor: props.backgroundColor
            }}>
                {props.children}
        </Box>
    )
}
