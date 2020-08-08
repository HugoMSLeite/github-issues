import React, { useContext } from 'react';
import {
  Container,
  Menu,
  Form
} from 'semantic-ui-react';
import { ThemeContext } from '../../Theme'

export default function Head(props) {
  const context = useContext(ThemeContext);
  return (
    <Menu fixed="top" inverted={context.theme === 'dark'}>
      <Container>
        <Menu.Item as='a' header>Github Issues</Menu.Item>
        <Menu.Item position="right">
          <Form inverted={context.theme === 'dark'}>
            <Form.Group>
              <Form.Checkbox toggle label="Dark theme" onChange={props.changeTheme} />
            </Form.Group>
          </Form>
        </Menu.Item>
      </Container>
    </Menu>
  )
}