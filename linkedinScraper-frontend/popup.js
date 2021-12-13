const btnScrap = document.querySelector('#scrapingButton')

btnScrap.addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

  if (tab !== null) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: scrapingProfile
    })
  }
})

const scrapingProfile = async () => {
  // Utils
  const wait = (milliseconds) =>
    new Promise((resolve) => {
      setTimeout(() => {
        resolve()
      }, milliseconds)
    })

  const autoScrollToElement = async function (cssSelector) {
    const exists = document.querySelector(cssSelector)

    while (exists) {
      const maxScrollTop = document.body.clientHeight - window.innerHeight
      const elementScrollTop = document.querySelector(cssSelector).offsetHeight
      const currentScrollTop = window.scrollY

      if (maxScrollTop === currentScrollTop || elementScrollTop <= currentScrollTop) break

      await wait(32)

      const newScrollTop = Math.min(currentScrollTop + 20, maxScrollTop)
      window.scrollTo(0, newScrollTop)
    }

    console.log('finish autoscroll to element %s', cssSelector)

    return new Promise((resolve) => {
      resolve()
    })
  }

  // Logic
  const selectorProfile = {
    personalInformation: {
      name: 'div.mt2.relative > div:nth-child(1) > div:nth-child(1) > h1',
      title: 'div.mt2.relative > div:nth-child(1) > div.text-body-medium.break-words',
      location: 'div.mt2.relative > div.pb2.pv-text-details__left-panel > span.text-body-small.inline.t-black--light.break-words',
      resume: '.inline-show-more-text.inline-show-more-text--is-collapsed.mt4.t-14'
    },
    experienceInformation: {
      list: '#experience-section > ul > li',
      groupByCompany: {
        identify: '.pv-entity__position-group',
        company: 'div.pv-entity__company-summary-info > h3 > span:nth-child(2)',
        list: 'section > ul > li',
        title: 'div > div > div > div > div > div > h3 > span:nth-child(2)',
        date: 'div > div > div > div > div > div > div > h4 > span:nth-child(2)',
        description: '.pv-entity__description'
      },
      default: {
        title: 'section > div > div > a > div.pv-entity__summary-info > h3',
        company: 'section > div > div > a > div.pv-entity__summary-info > p.pv-entity__secondary-title',
        date: 'section > div > div > a > div.pv-entity__summary-info > div > h4.pv-entity__date-range > span:nth-child(2)',
        description: 'section > div > div > div > p'
      }
    },
    educationInformation: {
      list: '#education-section > ul > li',
      institution: 'div > div > a > div.pv-entity__summary-info > div > h3',
      career: 'div > div > a > div.pv-entity__summary-info > div > p > span:nth-child(2)',
      date: 'div > div > a > div.pv-entity__summary-info > p > span:nth-child(2)'
    }
  }

  const clickOnMoreResume = async () => {
    const elementMoreResume = document.querySelector('#experience-section .pv-profile-section__see-more-inline')
    if (elementMoreResume) elementMoreResume.click()
  }

  const getPersonalInformation = async () => {
    const { personalInformation: selector } = selectorProfile
    const elementNameProfile = document.querySelector(selector.name)
    const elementNameTitle = document.querySelector(selector.title)
    const elementLocation = document.querySelector(selector.location)
    const elementResume = document.querySelector(selector.resume)

    const name = elementNameProfile?.innerText
    const title = elementNameTitle?.innerText
    const location = elementLocation?.innerText
    const resume = elementResume?.innerText
    return {
      name,
      title,
      location,
      resume
    }
  }

  const getExperienceInformation = async () => {
    const { experienceInformation: selector } = selectorProfile
    const experiencesRawList = document.querySelectorAll(selector.list)
    const experiencesRawArray = Array.from(experiencesRawList)

    const groupCompaniesList = experiencesRawArray.filter((el) => {
      const groupCompanyExperience = el.querySelectorAll(selector.groupByCompany.identify)
      return groupCompanyExperience.length > 0
    })

    const uniqueExperienceList = experiencesRawArray.filter((el) => {
      const groupCompanyExperience = el.querySelectorAll(selector.groupByCompany.identify)
      return groupCompanyExperience.length === 0
    })

    const experiences = uniqueExperienceList.map((el) => {
      const title = el.querySelector(selector.default.title)?.innerText
      const date = el.querySelector(selector.default.date)?.innerText
      const company = el.querySelector(selector.default.company)?.innerText
      const description = el.querySelector(selector.default.description)?.innerText

      return {
        title,
        date,
        company,
        description
      }
    })

    for (let i = 0; i < groupCompaniesList.length; i++) {
      const item = groupCompaniesList[i]
      const company = item.querySelector(selector.groupByCompany.company)?.innerText
      const itemsCompanyGroupList = item.querySelectorAll(selector.groupByCompany.list)
      const itemsCompanyGroupArray = Array.from(itemsCompanyGroupList)

      const experiencesData = itemsCompanyGroupArray.map((el) => {
        const title = el.querySelector(selector.groupByCompany.title)?.innerText
        const date = el.querySelector(selector.groupByCompany.date)?.innerText
        const description = el.querySelector(selector.groupByCompany.description)?.innerText

        return {
          title,
          date,
          company,
          description
        }
      })

      experiences.push(...experiencesData)
    }

    return experiences
  }

  const getEducationInformation = async () => {
    const { educationInformation: selector } = selectorProfile
    const educationItems = document.querySelectorAll(selector.list)
    const educationArray = Array.from(educationItems)
    const educations = educationArray.map((el) => {
      const institution = el.querySelector(selector.institution).innerText
      const career = el.querySelector(selector.career).innerText
      const date = el.querySelector(selector.date).innerText
      return { institution, career, date }
    })
    return educations
  }

  const createPopup = () => {
    const styleDiv =
      'position: fixed;z-index: 2000;width:100%; top: 0px;left: 0px;overflow: visible;display: flex;align-items: flex-end;background-color: lightgray;font-size: 10px;padding: 10px;'
    const stylePre = 'position: relative;max-height: 400px;overflow: scroll;width: 100%;'
    const div = document.createElement('div')
    div.id = 'krowdy-message'
    div.style = styleDiv

    const pre = document.createElement('pre')
    pre.id = 'krowdy-pre'
    pre.style = stylePre

    const button = document.createElement('button')

    button.id = 'krowdy-button'
    button.style = 'background: gray;border: 2px solid;padding: 8px;'
    button.innerText = 'Aceptar'

    const bodyElement = document.querySelector('div.body')

    bodyElement.appendChild(div)

    pre.innerText = 'Estamos extrayendo la información!!!!'
    div.appendChild(pre)
    div.appendChild(button)
    return { div, pre, button }
  }

  // Scroll to all information
  const { div, pre, button } = createPopup()

  pre.innerText = 'Escaneando el perfil'
  await autoScrollToElement('body')
  await clickOnMoreResume()

  // Scraping Complete Profile
  const personalInformation = await getPersonalInformation()
  const experienceInformation = await getExperienceInformation()
  const educationInformation = await getEducationInformation()

  pre.innerText = 'Ya tenemos las información del perfil'
  await wait(1000)

  // Setting data to send information
  const profile = { ...personalInformation, experiences: experienceInformation, educations: educationInformation }
  pre.innerText = JSON.stringify(profile, null, 2)

  button.addEventListener('click', async () => {
    console.log('button clicked')
    const response = await fetch('http://localhost:4000/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: `mutation createProfile($name: String!, $title: String!, $location: String!, $resume: String!, $experiences: [ExperienceInput], $educations: [EducationInput]) {
          createProfile(name: $name, title: $title, location: $location, resume: $resume,experiences: $experiences,educations: $educations) {
            name
            title
            location
            resume
            educations {
              career
              institution
              date
            }
            experiences {
              company
              title
              date
            }
          }
        }`,
        variables: {
          name: profile.name,
          title: profile.title,
          location: profile.location,
          resume: profile.resume,
          experiences: profile.experiences,
          educations: profile.educations
        }
      })
    })
    const responseData = await response.json()
    console.log("🚀 ~ file: popup.js ~ line 254 ~ button.addEventListener ~ responseData", responseData)
    div.remove()
  })
}
