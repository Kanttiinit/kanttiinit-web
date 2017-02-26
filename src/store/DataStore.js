// @flow
import {autorun, observable, computed} from 'mobx'
import orderBy from 'lodash/orderBy'
import moment from 'moment'
import get from 'lodash/get'
import haversine from 'haversine'

import Resource from './Resource'
import http from '../utils/http'
import type PreferenceStore from './PreferenceStore'
import type UIState from './UIState'
import type {UserType, AreaType, FavoriteType, FormattedFavoriteType, MenuType, RestaurantType} from './types'

const STARRED = -1
const NEARBY = -2

const isOpenNow = (restaurant, day) => {
  const weekday = day.weekday()
  if (!restaurant.openingHours[weekday]) {
    return false
  }
  const [open, close] = restaurant.openingHours[weekday].split(' - ')
  const now = moment()
  return now.isAfter(moment(open, 'HH:mm')) && now.isBefore(moment(close, 'HH:mm'))
}

const orderRestaurants = (restaurants, orderType) => {
  const order = {
    properties: ['isStarred', 'isOpenNow', 'noCourses', 'favoriteCourses', 'distance'],
    orders: ['desc', 'desc', 'asc', 'desc', 'asc']
  }
  if (orderType === 'ORDER_ALPHABET') {
    order.properties = ['isStarred', 'name']
    order.orders = ['desc', 'asc']
  } else if (orderType === 'ORDER_DISTANCE') {
    order.properties = ['isStarred', 'distance']
    order.orders = ['desc', 'asc']
  }
  return orderBy(restaurants, order.properties, order.orders)
}

export default class DataStore {
  locationWatchId: ?number
  @observable areas: Resource<Array<AreaType>> = new Resource([])
  @observable user: Resource<?UserType> = new Resource(null)
  @observable favorites: Resource<Array<FavoriteType>> = new Resource([])
  @observable menus: Resource<Array<MenuType>> = new Resource([])
  @observable restaurants: Resource<Array<RestaurantType>> = new Resource([])

  preferences: PreferenceStore
  uiState: UIState

  constructor(preferenceStore: PreferenceStore, uiState: UIState) {
    this.preferences = preferenceStore
    this.uiState = uiState

    autorun(() => {
      // start or stop watching for location
      if (this.preferences.useLocation && !this.locationWatchId) {
        this.locationWatchId = navigator.geolocation.watchPosition(({coords}) => {
          this.uiState.location = coords
        })
      } else if (!this.preferences.useLocation) {
        navigator.geolocation.clearWatch(this.locationWatchId)
        this.locationWatchId = null
        this.uiState.location = null
      }
    })

    autorun(async () => {
      const lang = this.preferences.lang
      this.areas.fetch(http.get('/areas'))
      this.favorites.fetch(http.get('/favorites'))
    })

    autorun(() => {
      if (this.user.fulfilled) {
        http.put('/me/preferences', this.preferences.preferences)
      }
    })

    autorun(() => {
      if (this.user.data) {
        this.preferences.preferences = this.user.data.preferences
      }
    })

    this.fetchUser()
  }

  async fetchUser() {
    this.user.fetch(http.get('/me', true))
  }

  @computed get selectedFavoriteIds(): Array<FavoriteType> {
    if (this.favorites.fulfilled) {
      return this.favorites.data.filter(({id}) => this.preferences.favorites.indexOf(id) > -1)
    }
    return []
  }

  @computed get selectedArea(): ?AreaType {
    return this.areas.data.find(a => a.id === this.preferences.selectedArea)
  }

  @computed get formattedFavorites(): Array<FormattedFavoriteType> {
    return orderBy(this.favorites.data, ['name']).map(favorite => ({
      ...favorite,
      isSelected: this.preferences.favorites.indexOf(favorite.id) > -1
    }))
  }

  @computed get restaurants() {
    const day = moment().add(this.uiState.dayOffset, 'day')
    const formattedRestaurants = this.restaurants.data
    .map(restaurant => {
      let favoriteCourses = 0
      const courses = get(this.menus, [restaurant.id, day.format('YYYY-MM-DD')], [])
      .filter(course => course.title)
      .map(course => {
        const isFavorite = this.favorites.data.some(favorite => course.title.match(new RegExp(favorite.regexp, 'i')))
        if (isFavorite) {
          favoriteCourses++
        }
        return {
          ...course,
          isFavorite
        }
      })
      const distance = location && haversine(location, restaurant, {unit: 'meter'})
      return {
        ...restaurant,
        courses,
        distance,
        noCourses: !courses.length,
        favoriteCourses: favoriteCourses > 0,
        isOpenNow: isOpenNow(restaurant, day),
        isStarred: this.preferences.starredRestaurants.includes(restaurant.id)
      }
    })
    .filter(restaurant => {
      if (this.preferences.selectedArea === STARRED) {
        return restaurant.isStarred
      } else if (this.preferences.selectedArea === NEARBY) {
        return restaurant.distance < 1500
      }
      const selectedArea = this.selectedArea
      return selectedArea && selectedArea.restaurants && selectedArea.restaurants.some(r => r.id === restaurant.id)
    })

    return orderRestaurants(formattedRestaurants, this.preferences.order)
  }
 }