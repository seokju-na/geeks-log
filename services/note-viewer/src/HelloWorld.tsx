import styled from '@emotion/styled';
import React from 'react';

const data: { value: string } = JSON.parse(process.env.NOTE_DATA || '');

export default function HelloWorld() {
  return (
    <Box>
      Hello World!! {data.value}
    </Box>
  );
}


const Box = styled.div`
  height: 300px;
`;
