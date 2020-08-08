import _ from 'lodash';
import React, { useEffect, useState, useCallback, useContext } from 'react';
import {
  Header,
  Grid,
  Segment,
  Table,
  Icon,
  Pagination,
  Form,
  Item
} from 'semantic-ui-react';
import { ThemeContext } from '../../Theme'

const pathGithub = 'https://api.github.com/repos/facebook/react/issues';

function exampleReducer(state, action) {
  switch (action.type) {
    case 'CHANGE_SORT':
      if (state.column === action.column) {
        return {
          ...state,
          issuesList: state.issuesList.reverse(),
          direction:
            state.direction === 'ascending' ? 'descending' : 'ascending',
        }
      }

      return {
        column: action.column,
        issuesList: _.sortBy(state.issuesList, [action.column]),
        direction: 'ascending',
      }
    case 'CHANGE_DATA':
      return {
        ...state,
        issuesList: action.data
      }
    default:
      throw new Error()
  }
}

export default function Home() {
  const context = useContext(ThemeContext);
  const [paginationTable, setPaginationTable] = useState({});
  const [inputs, setInputs] = useState({
    inputDate: null,
    selectState: null
  });

  const [state, dispatch] = React.useReducer(exampleReducer, {
    column: null,
    issuesList: [],
    direction: null,
  })
  const { column, issuesList, direction } = state
  const themeDark = context.theme === 'dark';

  const createPagination = (links) => {
    if (links) {
      var pages = {};
      links.split(',').forEach(link => {
        if (link.match('first'))
          pages.first = tratarLink(link);
        else if (link.match('prev'))
          pages.prev = tratarLink(link);
        else if (link.match('next'))
          pages.next = tratarLink(link);
        else if (link.match('last'))
          pages.last = tratarLink(link);
      });
      setPaginationTable(pages);
    } else {
      setPaginationTable({});
    }

    function tratarLink(link) {
      var strInit = link.search('=') + 1;
      var strEnd = link.search('>');
      return parseInt(link.substr(strInit, strEnd - strInit));
    }
  };

  const responseFetch = useCallback(async (resp) => {
    if (resp.status === 200) {
      const data = await resp.json();
      dispatch({ type: 'CHANGE_DATA', data: data });
      createPagination(resp.headers.get('link'));
    } else {
      dispatch({ type: 'CHANGE_DATA', data: [] });
    }
  }, []);

  useEffect(() => {
    (async () => {
      const resp = await fetch(pathGithub);
      responseFetch(resp);
    })();
  }, [responseFetch]);

  function handleGetLabels(labels) {
    if (labels) {
      const ret = labels.map(label => {
        return label.name;
      });
      return ret.toString();
    } else {
      return '';
    }
  }

  async function loadPage(e, ret) {
    const resp = await fetch(`${pathGithub}?page=${ret.activePage}`);
    responseFetch(resp);
  }

  function handleFormatDate(date) {
    let newDate = new Date(date);
    return newDate.toLocaleDateString() + " " + newDate.toLocaleTimeString();
  }

  async function handleSubmit() {
    const { inputDate, selectState } = inputs;
    let filter = inputDate ? `since=${inputDate}` : '';
    filter += filter ? selectState ? `&state=${selectState}` : '' : selectState ? `state=${selectState}` : '';
    const resp = await fetch(`${pathGithub}?${filter}`);
    responseFetch(resp);
  }

  return (
    <Segment inverted={themeDark} style={{ padding: '5em', margin: 0 }}>
      <Grid container>
        <Grid.Row>
          <Grid.Column>
            <Header attached='top' as='h4' inverted={themeDark}>
              Issues: facebook/react
            </Header>
            <Segment attached='bottom' inverted={themeDark}>
              <Form inverted={themeDark} onSubmit={handleSubmit}>
                <Form.Group widths="equal">
                  <Form.Input
                    type="date"
                    max={new Date().toISOString().split('T')[0]}
                    fluid
                    label='Issues sicen:'
                    placeholder='dd/mm/yyyy'
                    onChange={(e, { value }) => setInputs(old => { return { ...old, inputDate: value } })} />
                  <Form.Select
                    fluid
                    label="Status"
                    placeholder='Status'
                    options={[{ key: 'open', text: 'open', value: 'open' },
                    { key: 'closed', text: 'closed', value: 'closed' },
                    { key: 'all', text: 'all', value: 'all' }]}
                    onChange={(e, { value }) => setInputs(old => { return { ...old, selectState: value } })}
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Button type='submit'>Filter</Form.Button>
                </Form.Group>
              </Form>
              <Table celled inverted={themeDark} selectable sortable fixed>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell
                      sorted={column === 'number' ? direction : null}
                      onClick={() => { dispatch({ type: 'CHANGE_SORT', column: 'number' }); console.log('click') }}
                    >Issue Number</Table.HeaderCell>
                    <Table.HeaderCell>Title</Table.HeaderCell>
                    <Table.HeaderCell
                      sorted={column === 'created_at' ? direction : null}
                      onClick={() => dispatch({ type: 'CHANGE_SORT', column: 'created_at' })}
                    >Created At</Table.HeaderCell>
                    <Table.HeaderCell
                      sorted={column === 'updated_at' ? direction : null}
                      onClick={() => dispatch({ type: 'CHANGE_SORT', column: 'updated_at' })}
                    >Updated At</Table.HeaderCell>
                    <Table.HeaderCell>Labels</Table.HeaderCell>
                    <Table.HeaderCell>State</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {issuesList.length === 0 && (
                    <Table.Row>
                      <Table.Cell colSpan={6} textAlign="center">Issues not found</Table.Cell>
                    </Table.Row>
                  )}
                  {issuesList.map((issue, index) => {
                    return (
                      <Table.Row key={index}>
                        <Table.Cell><Item as="a" href={issue.html_url} target="blank">{issue.number}</Item></Table.Cell>
                        <Table.Cell>{issue.title}</Table.Cell>
                        <Table.Cell>{handleFormatDate(issue.created_at)}</Table.Cell>
                        <Table.Cell>{handleFormatDate(issue.updated_at)} </Table.Cell>
                        <Table.Cell>{handleGetLabels(issue.labels)} </Table.Cell>
                        <Table.Cell>{issue.state}</Table.Cell>
                      </Table.Row>
                    )
                  })}
                </Table.Body>
                <Table.Footer>
                  <Table.Row>
                    <Table.HeaderCell colSpan='6'>
                      {paginationTable.last && (<Pagination
                        floated='right'
                        totalPages={paginationTable.last}
                        defaultActivePage={1}
                        boundaryRange={1}
                        siblingRange={1}
                        ellipsisItem={null}
                        firstItem={null}
                        lastItem={null}
                        prevItem={{ content: <Icon name='angle left' />, icon: true }}
                        nextItem={{ content: <Icon name='angle right' />, icon: true }}
                        onPageChange={loadPage}
                      />)}
                    </Table.HeaderCell>
                  </Table.Row>
                </Table.Footer>
              </Table>
            </Segment>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Segment>
  )
}