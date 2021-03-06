import axios from 'axios'
import thunk from 'redux-thunk'
import * as spyExpect from 'expect'
import configureMockStore from 'redux-mock-store'

import * as actions from '../issActions'
import * as types from '../../store/constants'

describe('action creators', () => {
  it('should create an iss address request success action', () => {
    const addresses = []
    const expectedAction = {
      type: types.ISS_ADDRESS_REQUEST_SUCCESS,
      payload: addresses,
    }
    expect(actions.getLocationRequestSuccess(addresses)).toEqual(expectedAction)
  })

  it('should create an iss address request error action', () => {
    const errorMsg = 'Network error'
    const expectedAction = {
      type: types.ISS_ADDRESS_REQUEST_ERROR,
      payload: errorMsg,
    }
    expect(actions.getLocationRequestError(errorMsg)).toEqual(expectedAction)
  })

  it('should create an iss request pending action', () => {
    const expectedAction = {
      type: types.ISS_REQUEST_PENDING,
    }
    expect(actions.getIssPositionRequestPending()).toEqual(expectedAction)
  })

  it('should create an iss request success action', () => {
    const data = {}
    const expectedAction = {
      type: types.ISS_REQUEST_SUCCESS,
      payload: data,
    }
    expect(actions.getIssPositionRequestSuccess(data)).toEqual(expectedAction)
  })

  it('should create an iss request error action', () => {
    const errorMsg = 'Network error'
    const expectedAction = {
      type: types.ISS_REQUEST_ERROR,
      payload: errorMsg,
    }
    expect(actions.getIssPositionRequestError(errorMsg)).toEqual(expectedAction)
  })
})

/**
 * Async actions
 */
const mockStore = configureMockStore([thunk])

// set up to mock axios methods
const fakeGet = axios.get

/**
 * Tests for getIssPositionRequest() action
 */
const fakeISSRequestPayload = { status: 200, data: { longitude: 0, latitude: 0 } }

describe('async iss api request action resolved', () => {
  beforeEach(() => {
    // replace the .get method temporarily with a spy
    axios.get = spyExpect.createSpy().andReturn(Promise.resolve(fakeISSRequestPayload))
  })

  afterEach(() => {
    // restore the get method with our saved const
    axios.get = fakeGet
  })

  it('Shold dispatch actions when iss request is successful', () => {
    const store = mockStore({
      iss: {},
    })
    const expected = [
      { type: types.ISS_REQUEST_PENDING },
      { type: types.ISS_REQUEST_SUCCESS, payload: fakeISSRequestPayload.data },
    ]

    return store.dispatch(actions.getIssPositionRequest())
      .then(() => {
        expect(store.getActions()[0]).toEqual(expected[0])
        expect(store.getActions()[1].type).toEqual(types.ISS_REQUEST_SUCCESS)
        expect(store.getActions()[1]).toHaveProperty('payload')
        expect(store.getActions()[1].payload).toHaveProperty('longitude')
        expect(store.getActions()[1].payload).toHaveProperty('latitude')
      })
  })
})

const fakeErrorRequestPayload = { status: 404, response: { data: { error: 'satellite not found' } } }
describe('async action rejected', () => {
  beforeEach(() => {
    // replace the .get method temporarily with a spy
    axios.get = spyExpect.createSpy().andReturn(Promise.reject(fakeErrorRequestPayload))
  })

  afterEach(() => {
    // restore the get method with our saved const
    axios.get = fakeGet
  })

  it('Shold dispatch actions when iss request return error', () => {
    const store = mockStore({
      iss: {},
    })
    const expected = [
      { type: types.ISS_REQUEST_PENDING },
      { type: types.ISS_REQUEST_ERROR, payload: fakeErrorRequestPayload.response.data.error },
    ]

    return store.dispatch(actions.getIssPositionRequest())
      .then(() => {
        expect(store.getActions()[0]).toEqual(expected[0])
        expect(store.getActions()[1].type).toEqual(types.ISS_REQUEST_ERROR)
        expect(store.getActions()[1]).toHaveProperty('payload')
        expect(store.getActions()[1].payload).toBe('satellite not found')
      })
  })

  it('Shold dispatch actions when google api request return error', () => {
    const store = mockStore({
      iss: {},
    })
    const expected = {
      type: types.ISS_ADDRESS_REQUEST_ERROR,
      payload: 'Can not get addresses from Google API.',
    }

    return store.dispatch(actions.getLocationRequest(0, 0))
      .then(() => {
        const storeAction = store.getActions()[0]
        expect(storeAction).toEqual(expected)
        expect(storeAction.type).toEqual(types.ISS_ADDRESS_REQUEST_ERROR)
        expect(typeof (storeAction.payload)).toEqual('string')
      })
  })
})


const fakeGeoLocationRequestSuccessPayload = { data: { status: 'OK', results: [] } }
describe('async google api request action resolved', () => {
  beforeEach(() => {
    // replace the .get method temporarily with a spy
    axios.get = spyExpect.createSpy()
      .andReturn(Promise.resolve(fakeGeoLocationRequestSuccessPayload))
  })

  afterEach(() => {
    // restore the get method with our saved const
    axios.get = fakeGet
  })

  it('Shold dispatch actions when google api request is successful', () => {
    const store = mockStore({
      iss: {},
    })

    const expected = {
      type: types.ISS_ADDRESS_REQUEST_SUCCESS,
      payload: [],
    }

    return store.dispatch(actions.getLocationRequest(44, -99))
      .then(() => {
        const storeAction = store.getActions()[0]
        expect(storeAction.type).toEqual(expected.type)
        expect(storeAction.payload).toEqual(expected.payload)
      })
  })
})
